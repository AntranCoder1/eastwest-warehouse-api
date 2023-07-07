import { product_transfer } from "../models/product_transfer.models";
import sequelize, { Op, where } from "sequelize";

export const createNewProductTransfer = (
  data,
  productId,
  totalAmountAfterMoving,
  workListId,
  quantityOriginal
) => {
  const created = new Date();
  const updated = new Date();

  const newProductTransfer = new product_transfer({
    SKU_product: data.SKU,
    Product_Name: data.productName,
    Quantity_Transfer: data.quantity,
    From_Location_Barcodes: data.formLocationBarcode,
    To_Location_Barcodes: data.toLocationBarcode,
    Quantity_After_Transfer: totalAmountAfterMoving,
    product_Id: productId,
    work_list_id: workListId,
    created_at: created,
    updated_at: updated,
    original_number: quantityOriginal,
  });

  return newProductTransfer.save();
};

export const createNewProductTransfers = (
  data,
  productId,
  totalAmountAfterMoving,
  quantityOriginal
) => {
  const created = new Date();
  const updated = new Date();

  const newProductTransfer = new product_transfer({
    SKU_product: data.SKU,
    Product_Name: data.productName,
    Quantity_Transfer: data.quantity,
    From_Location_Barcodes: data.formLocationBarcode,
    To_Location_Barcodes: data.toLocationBarcode,
    Quantity_After_Transfer: totalAmountAfterMoving,
    product_Id: productId,
    created_at: created,
    updated_at: updated,
    original_number: quantityOriginal,
  });

  return newProductTransfer.save();
};

export const updateProductTransfer = (data) => {
  const updated = new Date();

  return product_transfer.update(
    {
      SKU_product: data.SKU,
      Product_Name: data.productName,
      Quantity_Transfer: data.quantity,
      From_Location_Barcodes: data.formLocationBarcode,
      To_Location_Barcodes: data.toLocationBarcode,
      product_Id: data.productId,
      work_list_id: data.workListId,
      updated_at: updated,
      // original_number: data.quantityQriginal,
    },
    { where: { id: { [Op.in]: data.transferDetailId } } }
  );
};

export const getTranferId = (transferId) => {
  return product_transfer.findOne({
    where: { id: transferId },
    include: [
      {
        association: product_transfer.associations.location_managermenrt,
      },
    ],
  });
};
