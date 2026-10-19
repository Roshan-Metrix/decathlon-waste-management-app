
const calculateTransactionAmounts = (items = []) => {
    let total = 0;
    let receivable = 0;
    let payable = 0;

    for (const item of updatedTransaction.items) {
        const amount = Number(
            (item.materialRate * item.weight).toFixed(2)
        );

        total += Math.abs(amount);

        if (amount > 0) {
            receivable += amount;
        } else if (amount < 0) {
            payable += Math.abs(amount);
        }
    }

    return {
        total,
        receivable,
        payable,
        net: receivable - payable,
    };
};

export default calculateTransactionAmounts;
