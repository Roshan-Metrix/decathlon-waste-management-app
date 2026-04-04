import transactionModel from "../models/transactionModel.js";

/**
 * Fetch all transactions for a specific store within a date range
 * @param {string} storeId - Store ID to filter transactions
 * @param {Date} fromDate - Start date (00:00:00)
 * @param {Date} toDate - End date (23:59:59)
 * @param {string|null} vendorName - Optional vendor name to scope the report
 * @returns {Object} Transaction data with material stats
 */
export const fetchTransactionsByDateRange = async (
  storeId,
  fromDate,
  toDate,
  vendorName = null
) => {
  try {
    const matchStage = { "store.storeId": storeId };

    if (vendorName) {
      matchStage.vendorName = vendorName;
    }

    const transactions = await transactionModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: {
                $and: [
                  { $gte: ["$$item.createdAt", fromDate] },
                  { $lte: ["$$item.createdAt", toDate] },
                ],
              },
            },
          },
        },
      },
      { $match: { "items.0": { $exists: true } } },
    ]);

    const materialStats = {};
    const vendorNames = new Set();
    let totalWeight = 0;
    let totalAmount = 0;
    let totalItems = 0;

    transactions.forEach((txn) => {
      if (txn.vendorName) {
        vendorNames.add(txn.vendorName);
      }

      txn.items.forEach((item) => {
        const type = item.materialType;
        const rate = parseFloat(item.materialRate || 0);
        const weight = parseFloat(item.weight || 0);

        if (!materialStats[type]) {
          materialStats[type] = {
            materialType: type,
            totalItems: 0,
            totalAmount: 0,
            weight: 0,
            rate: 0,
          };
        }

        materialStats[type].totalItems += 1;
        materialStats[type].weight += weight;
        materialStats[type].totalAmount += weight * rate;
        materialStats[type].rate = rate;

        totalWeight += weight;
        totalAmount += weight * rate;
        totalItems += 1;
      });
    });

    // Format and round to two decimal places
    const items = Object.values(materialStats).map((entry) => ({
      materialType: entry.materialType,
      totalItems: entry.totalItems,
      rate: parseFloat(entry.rate.toFixed(2)),
      totalAmount: parseFloat(entry.totalAmount.toFixed(2)),
      weight: parseFloat(entry.weight.toFixed(2)),
    }));

    return {
      success: true,
      vendorNames: [...vendorNames],
      vendorName: vendorName || (transactions.length > 0 ? transactions[0].vendorName : "N/A"),
      storeName: transactions.length > 0 ? transactions[0].store.storeName : "N/A",
      storeLocation:
        transactions.length > 0 ? transactions[0].store.storeLocation : "N/A",
      storeState:
        transactions.length > 0 ? transactions[0].store.storeState : "N/A",
      totalTransactions: transactions.length,
      totalItems,
      totalWeight: parseFloat(totalWeight.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      items,
    };
  } catch (error) {
    console.error("Error in fetchTransactionsByDateRange:", error);
    throw new Error(
      error.message || "Failed to fetch transactions by date range"
    );
  }
};

/**
 * Fetch all unique stores for a vendor
 * @param {string} vendorName - Vendor name to filter transactions
 * @returns {Array} Array of unique store objects
 */
export const fetchAllStoresForVendor = async (vendorName) => {
  try {
    const transactions = await transactionModel
      .find({ vendorName: vendorName })
      .select("store");

    const uniqueStores = [];
    const seenStoreIds = new Set();

    transactions.forEach((txn) => {
      if (!seenStoreIds.has(txn.store.storeId)) {
        seenStoreIds.add(txn.store.storeId);
        uniqueStores.push({
          storeId: txn.store.storeId,
          storeName: txn.store.storeName,
          storeLocation: txn.store.storeLocation,
          storeState: txn.store.storeState,
        });
      }
    });

    return uniqueStores;
  } catch (error) {
    console.error("Error in fetchAllStoresForVendor:", error);
    throw new Error(error.message || "Failed to fetch vendor stores");
  }
};

/**
 * Fetch all vendors from database
 * @returns {Array} Array of all vendors
 */
export const fetchAllVendors = async () => {
  try {
    const transactions = await transactionModel.distinct("vendorName");
    return transactions;
  } catch (error) {
    console.error("Error in fetchAllVendors:", error);
    throw new Error(error.message || "Failed to fetch vendors");
  }
};
