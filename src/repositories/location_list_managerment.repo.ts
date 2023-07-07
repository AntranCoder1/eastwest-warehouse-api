import { location_list_managerment } from "../models/location_list_managerment.model";
import sequelize, { Op } from "sequelize";

export const createListLocation = (skuProduct, id, locBarcodes) => {
  const created = new Date();
  const updated = new Date();

  const arrListLocation = [];

  for (const i of skuProduct) {
    const list = {
      SKU: i.SKU,
      Quantity: i.Quantity,
      location_managerment_id: id,
      created_at: created,
      updated_at: updated,
      Loc_Barcode: locBarcodes,
    };

    arrListLocation.push(list);
  }

  return location_list_managerment.bulkCreate(arrListLocation);
};

// export const createListLocation = (skuProduct, locBarcodes) => {
//   const created = new Date();
//   const updated = new Date();

//   const newLocation = new location_list_managerment({
//     SKU: skuProduct.SKU,
//     Quantity: skuProduct.Quantity,
//     location_managerment_id: null,
//     created_at: created,
//     updated_at: updated,
//     Loc_Barcode: locBarcodes,
//   });

//   return newLocation.save();
// };

export const deleteListLocation = (listLocationId) => {
  return location_list_managerment.destroy({
    where: { id: { [Op.in]: listLocationId } },
  });
};

export const updateListLocation = (skuProductEdit, locationId) => {
  const updated = new Date();

  const ids = skuProductEdit.map((item) => item.id);

  for (const i of skuProductEdit) {
    const locationList = {
      SKU: i.SKU,
      Quantity: i.Quantity,
      location_managerment_id: locationId,
      updated_at: updated,
    };
    return location_list_managerment.update(locationList, {
      where: { id: { [Op.in]: ids } },
    });
  }
};

export const importFile = (data, id) => {
  const created = new Date();
  const updated = new Date();

  const newLocation = new location_list_managerment({
    SKU: data.SKU,
    Quantity: data.Quantity,
    location_managerment_id: id,
    created_at: created,
    updated_at: updated,
  });
  return newLocation.save();
};

export const findBySKU = (sku) => {
  return location_list_managerment.findOne({
    where: {
      SKU: sku,
    },
  });
};

export const updateQuantity = (sku, totalQuantity) => {
  const updated = new Date();

  return location_list_managerment.update(
    {
      Quantity: totalQuantity,
      updated_at: updated,
    },
    {
      where: { SKU: sku },
    }
  );
};

export const createLocationListProduct = async (data, productId, UPC) => {
  const created = new Date();
  const updated = new Date();

  const newProduct = new location_list_managerment({
    SKU: data.sku_product,
    Quantity: data.quantity,
    location_managerment_id: null,
    created_at: created,
    updated_at: updated,
    Loc_Barcode: data.Loc_Barcode,
    product_managerment_id: productId,
    UPC: UPC,
  });
  return newProduct.save();
};

export const updateProductLocation = (data, productId) => {
  return location_list_managerment.update(
    { SKU: data.sku_product, Quantity: data.quantity },
    { where: { product_managerment_id: productId } }
  );
};

// export const createTransfer = (data, productId, quantityTransfer) => {
//   const transfer_date = new Date();

//   return location_list_managerment.update(
//     {
//       From_Location_Barcodes: data.formLocationBarcode,
//       To_Location_Barcodes: data.toLocationBarcode,
//       Quantity_After_Transfer: quantityTransfer,
//       transfer_date: transfer_date,
//     },
//     { where: { product_managerment_id: productId } }
//   );
// };

export const getLocationListWithSku = (sku) => {
  return location_list_managerment.findOne({
    where: {
      SKU: sku,
    },
  });
};

export const updateProductLocationLoc = (data, productId) => {
  return location_list_managerment.update(
    { Loc_Barcode: data.sku_product, Quantity: data.quantity },
    { where: { product_managerment_id: productId } }
  );
};
