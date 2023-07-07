import { product_location } from "../models/product_location.models";
import { location_managermenrt } from "../models/location_managermenrt.model";
import sequelize, { Op, where } from "sequelize";

export const create = (arrLocation, data, productId, productName) => {
  const created = new Date();
  const updated = new Date();

  const newLocation = new product_location({
    SKU_product: data.sku_product,
    Loc_Barcodes: arrLocation.Loc_Barcodes,
    Quantity: data.Quantity,
    created_at: created,
    updated_at: updated,
    UPC: data.UPC,
    product_managerment_id: productId,
    product_name: productName,
    location_managerment_id: arrLocation.locationId,
    product_location_type: arrLocation.type,
  });

  return newLocation.save();
};

export const createProduct = (arrLocation, data, productId, productName) => {
  const created = new Date();
  const updated = new Date();

  console.log("arrLocation", arrLocation);

  const newLocation = new product_location({
    SKU_product: data.sku_product,
    Loc_Barcodes: arrLocation.location[0].Loc_Barcodes,
    Quantity: Number(arrLocation.quantity),
    created_at: created,
    updated_at: updated,
    UPC: data.UPC,
    product_managerment_id: productId,
    product_name: productName,
    location_managerment_id: arrLocation.location[0].id,
  });

  return newLocation.save();
};

export const createProductEditPicking = (
  arrLocation,
  data,
  productId,
  productName
) => {
  const created = new Date();
  const updated = new Date();

  console.log("arrLocation", arrLocation);

  const newLocation = new product_location({
    SKU_product: data.sku_product,
    Loc_Barcodes: arrLocation.Loc_Barcodes,
    Quantity: data.quantity,
    created_at: created,
    updated_at: updated,
    UPC: data.UPC,
    product_managerment_id: productId,
    product_name: productName,
    location_managerment_id: arrLocation.id,
  });

  return newLocation.save();
};

export const createProductUpdate = (
  arrLocation,
  data,
  productId,
  productName
) => {
  const created = new Date();
  const updated = new Date();

  const newLocation = new product_location({
    SKU_product: data.sku_product,
    Loc_Barcodes: arrLocation.location[0].Loc_Barcodes,
    Quantity: Number(arrLocation.quantity),
    created_at: created,
    updated_at: updated,
    UPC: data.UPC,
    product_managerment_id: productId,
    product_name: productName,
    location_managerment_id: data.locationId,
  });

  return newLocation.save();
};

export const importFileProduct = (
  location,
  productId,
  dataProduct,
  locationId
) => {
  const created = new Date();
  const updated = new Date();

  const newLocation = new product_location({
    SKU_product: dataProduct.SKU,
    Loc_Barcodes: location,
    Quantity: dataProduct.Quantity,
    created_at: created,
    updated_at: updated,
    UPC: dataProduct.UPC,
    product_managerment_id: productId,
    product_name: dataProduct.productName,
    location_managerment_id: locationId,
  });

  return newLocation.save();
};

export const updateProductLocation = (data, productId) => {
  return product_location.update(
    {
      SKU_product: data.sku_product,
      Quantity: data.quantity,
    },
    {
      where: {
        product_managerment_id: productId,
      },
    }
  );
};

export const updateLocationProduct = (data) => {
  const updated = new Date();

  const ids = data.map((item) => item.id);

  for (const i of data) {
    const location = {
      Loc_Barcodes: i.location,
    };
    return product_location.update(location, {
      where: { id: { [Op.in]: ids } },
    });
  }
};

export const deleteLocationProduct = (locationId) => {
  return product_location.destroy({
    where: { id: { [Op.in]: locationId } },
  });
};

export const createLocationProduct = (
  arrLocation,
  productId,
  quantity,
  Container,
  sku_product
) => {
  const created = new Date();
  const updated = new Date();

  const arrLocations = [];

  for (const i of arrLocation) {
    const location = {
      SKU_product: sku_product,
      Loc_Barcodes: i.location,
      Quantity: quantity,
      created_at: created,
      updated_at: updated,
      Container: Container,
      product_managerment_id: productId,
    };

    arrLocations.push(location);
  }

  return product_location.bulkCreate(arrLocations);
};

export const createLocation = (
  arrProduct,
  locBarcode,
  UPC,
  productId,
  productName,
  locationId
) => {
  const created = new Date();
  const upated = new Date();

  const newProduct = new product_location({
    SKU_product: arrProduct.SKU[0].SKU_product,
    Loc_Barcodes: locBarcode,
    Quantity: arrProduct.Quantity,
    created_at: created,
    updated_at: upated,
    product_managerment_id: productId,
    product_name: productName,
    location_managerment_id: locationId,
  });

  return newProduct.save();
};

export const findAll = () => {
  return product_location.findAll({
    include: [
      {
        association: product_location.associations.product_managerment,
      },
    ],
    order: sequelize.literal("SKU_product"),
  });
};

export const getProductLocationWithId = (productLocationId) => {
  return product_location.findOne({
    where: {
      id: productLocationId,
    },
    include: [
      {
        association: product_location.associations.product_managerment,
      },
    ],
  });
};

export const search = (name) => {
  let query = {};
  if (name !== "") {
    query = {
      [Op.or]: [
        {
          product_name: {
            [Op.substring]: name,
          },
        },
        {
          SKU_product: {
            [Op.substring]: name,
          },
        },
      ],
    };
  }
  return product_location.findAll({
    where: query,
    include: [
      {
        association: product_location.associations.product_managerment,
      },
    ],
    order: sequelize.literal("SKU_product"),
  });
};

export const deleteProductLocation = (productLocationId) => {
  return product_location.destroy({ where: { id: productLocationId } });
};

export const getPrductWithSKU = (sku, locbarcodes) => {
  return product_location.findOne({
    where: {
      SKU_product: sku,
      Loc_Barcodes: locbarcodes,
    },
  });
};

export const getPrductWithSKUId = (sku, locationId) => {
  return product_location.findOne({
    where: {
      SKU_product: sku,
      location_managerment_id: locationId,
    },
  });
};

export const updateFromLocation = (productId, quantity, productLocationId) => {
  const updated = new Date();

  return product_location.update(
    { Quantity: quantity, updated_at: updated },
    { where: { id: productLocationId, product_managerment_id: productId } }
  );
};

export const createLocationProductTransfer = (arrProduct, productId) => {
  const created = new Date();
  const upated = new Date();

  const newProduct = new product_location({
    SKU_product: arrProduct.SKU,
    Loc_Barcodes: arrProduct.TO,
    Quantity: arrProduct.QTY,
    created_at: created,
    updated_at: upated,
    product_managerment_id: productId,
  });

  return newProduct.save();
};

// export const updateProductLocationInfo = (
//   data,
//   quantity,
//   location,
//   upc,
//   productId,
//   productName,
//   locationId
// ) => {
//   const created = new Date();
//   const updated = new Date();

//   const newProductLocation = new product_location({
//     SKU_product: data.SKU_product,
//     Loc_Barcodes: location,
//     Quantity: quantity.Quantity,
//     created_at: created,
//     updated_at: updated,
//     UPC: upc,
//     product_managerment_id: productId,
//     product_name: productName,
//     location_managerment_id: locationId,
//   });

//   return newProductLocation.save();
// };

export const updateProductLocationInfo = (
  data,
  quantity,
  location,
  upc,
  productId,
  productName,
  locationId
) => {
  const updated = new Date();

  return product_location.update(
    { SKU_product: data.SKU_product, Quantity: quantity.Quantity },
    { where: { id: quantity.id } }
  );
};

export const findCountAllProduct = () => {
  return product_location.findAndCountAll({
    include: [
      {
        association: product_location.associations.product_managerment,
      },
    ],
  });
};

export const findCountAllProducts = (limit, offset) => {
  return product_location.findAndCountAll({
    include: [
      {
        association: product_location.associations.product_managerment,
      },
    ],
    limit,
    offset,
  });
};

export const findProductWithQR = (qr) => {
  return product_location.findAll({
    where: { Loc_Barcodes: qr },
  });
};

export const findProductWithUPC = (qr) => {
  return product_location.findAll({
    where: { UPC: qr },
  });
};

export const updateUpc = (upc, productLocationId) => {
  return product_location.update(
    { UPC: upc },
    { where: { id: productLocationId } }
  );
};

export const findAllWithProductId = (productId) => {
  return product_location.findAll({
    where: { product_managerment_id: productId },
  });
};

export const findAllProductWithLoc = (locationId) => {
  return product_location.findAll({
    where: {
      location_managerment_id: locationId,
    },
  });
};

export const getAllProductLocationInventory = () => {
  return product_location.findAll({
    where: {
      product_location_type: "Inventory",
    },
    include: [
      {
        association: product_location.associations.product_managerment,
      },
    ],
  });
};

export const getInvenId = (productId) => {
  return product_location.findOne({
    where: {
      id: productId,
      product_location_type: "Inventory",
    },
    include: [
      {
        association: product_location.associations.product_managerment,
      },
    ],
  });
};

export const searchInvenSku = (search) => {
  let query = {};
  if (search !== "") {
    query = {
      SKU_product: {
        [Op.substring]: search,
      },
      product_location_type: "Inventory",
    };
  }
  return product_location.findAll({
    where: query,
    include: [
      {
        association: product_location.associations.product_managerment,
      },
    ],
  });
};

export const searchInvenLoc = (search) => {
  let query = {};
  if (search !== "") {
    query = {
      Loc_Barcodes: {
        [Op.substring]: search,
      },
      product_location_type: "Inventory",
    };
  }
  return product_location.findAll({
    where: query,
    include: [
      {
        association: product_location.associations.product_managerment,
      },
    ],
  });
};

export const updateQuantityReceiving = (productLocationId, quantity) => {
  const updated = new Date();

  return product_location.update(
    { Quantity: quantity, updated_at: updated },
    { where: { id: productLocationId } }
  );
};

export const getAllProductWithSku = (sku) => {
  return product_location.findAll({ where: { SKU_product: sku } });
};

export const updateQuantityAdjustment = (quantity, sku, location) => {
  const updated = new Date();

  return product_location.update(
    { Quantity: quantity, updated_at: updated },
    { where: { SKU_product: sku, Loc_Barcodes: location } }
  );
};

export const updateQuantityOriginal = (sku, location, quantity) => {
  return product_location.update(
    { Quantity_Transfer: quantity },
    { where: { SKU_product: sku, Loc_Barcodes: location } }
  );
};

export const getInventoryCountByLoc = (arrSku: any) => {
  return product_location.findAll({
    where: {
      SKU_product: { [Op.in]: arrSku },
    },
    // limit: pageSize,
    // offset: page * pageSize,
  });
};

export const getAllQuantityInLocation = (sku) => {
  return product_location.findAll({
    where: {
      SKU_product: sku,
    },
  });
};

export const findAllProductLocation = (arrPro: any) => {
  return product_location.findAll({
    where: {
      [Op.and]: [
        {
          product_managerment_id: { [Op.in]: arrPro },
        },
      ],
    },
  });
};
