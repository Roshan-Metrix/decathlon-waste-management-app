import managerModel from "../models/managerModel.js";
import storeModel from "../models/storeModel.js";

// export const getAllManagers = async (req, res) => {
//   try {
//     const managers = await managerModel.find().select("-password -__v");
//     const storeName = await storeModel.findOne(managers.storeId).select("-password -__v");

//     return res.json({
//       success: true,
//       count: managers.length,
//       managers,
//       storeName : storeName.name,
//     });

//   } catch (error) {
//     console.log("Error in getAllManagers Controller : ",error)
//     return res.json({ success: false, message: error.message });
//   }
// };

export const getAllManagers = async (req, res) => {
  try {
    const managers = await managerModel.find().select("-password -__v");

    const managerWithStore = await Promise.all(
      managers.map(async (m) => {
        const store = await storeModel.findOne({ storeId: m.storeId });

        return {
          ...m.toObject(),
          storeName: store ? store.name : "Unknown Store",
          storeLocation: store ? store.storeLocation : "",
        };
      })
    );

    return res.json({
      success: true,
      count: managerWithStore.length,
      managers: managerWithStore,
    });

  } catch (error) {
    console.log("Error in getAllManagers Controller:", error);
    return res.json({ success: false, message: error.message });
  }
};
