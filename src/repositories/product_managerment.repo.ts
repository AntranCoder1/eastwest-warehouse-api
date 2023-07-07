import { product_managerment } from "../models/product_managerment.model";
import sequelize, { Op, where } from "sequelize";

export const createProduct = async (data) => {
  const created = new Date();
  const updated = new Date();

  const newProduct = new product_managerment({
    SKU_product: data.sku_product,
    Product_Name: data.product_name,
    Image_URL: data.imageUrl,
    created_at: created,
    updated_at: updated,
    UPC: data.UPC,
    workListDetailId: data.workListDetailId,
  });
  return newProduct.save();
};

export const createProductImport = async (data) => {
  const created = new Date();
  const updated = new Date();

  const newProduct = new product_managerment({
    SKU_product: data.SKU,
    Product_Name: data.productName,
    Image_URL: data.Images,
    created_at: created,
    updated_at: updated,
    UPC: data.UPC,
    workListDetailId: data.workListDetailId,
    image_type: "link",
  });
  return newProduct.save();
};

export const seachName = (name) => {
  let query = {};
  if (name !== "") {
    query = {
      [Op.or]: [
        {
          Product_Name: {
            [Op.substring]: name,
          },
        },
        {
          SKU_product: {
            [Op.substring]: name,
          },
        },
      ],
      [Op.and]: [
        {
          isDeleted: 0 || null,
        },
      ],
    };
  }
  return product_managerment.findAll({
    where: query,
    include: [
      {
        association: product_managerment.associations.product_location,
      },
      // {
      //   association: product_managerment.associations.location_managermenrt,
      // },
    ],
    // order: [["Product_Name", "ASC"]],
  });
};

// export const importWorker = async (parsedData) => {
//   const created = new Date();
//   const updated = new Date();

//   const productArr = [];

//   for (const i of parsedData) {
//     const newWorker = {
//       SKU_product: i.sku_product,
//       Product_Name: i.product_name,
//       Image_URL: i.imageUrl,
//       created_at: created,
//       updated_at: updated,
//     };

//     productArr.push(newWorker);
//   }

//   return product_managerment.bulkCreate(productArr);
// };

export const finAll = () => {
  return product_managerment.findAll({
    where: {
      isDeleted: 0 || null,
    },
    include: [
      {
        association: product_managerment.associations.product_location,
      },
      // {
      //   association: product_managerment.associations.location_list_managerment,
      // },
      // {
      //   association: product_managerment.associations.location_managermenrt,
      // },
    ],
    order: [["SKU_product", "ASC"]],
  });
};

export const findById = (id) => {
  return product_managerment.findOne({
    where: {
      id: id,
    },
    include: [
      {
        association: product_managerment.associations.product_location,
      },
      // {
      //   association: product_managerment.associations.location_list_managerment,
      // },
      // {
      //   association: product_managerment.associations.location_managermenrt,
      // },
    ],
  });
};

export const deleteProduct = (productId) => {
  return product_managerment.update(
    { isDeleted: 1 },
    { where: { id: productId } }
  );
};

export const updateProduct = (data, productId) => {
  const updated = new Date();

  return product_managerment.update(
    {
      SKU_product: data.sku_product,
      Product_Name: data.product_name,
      updated_at: updated,
      UPC: data.UPC,
    },
    { where: { id: productId } }
  );
};

export const updateImageProduct = (data, productId) => {
  return product_managerment.update(
    {
      Image_URL: data.imageUrl,
    },
    { where: { id: productId } }
  );
};

export const getProductWithSku = (sku) => {
  return product_managerment.findOne({
    where: {
      SKU_product: sku,
    },
    // include: [
    //   {
    //     association: product_managerment.associations.location_list_managerment,
    //   },
    //   {
    //     association: product_managerment.associations.location_managermenrt,
    //   },
    // ],
  });
};

export const findProductWithBar = (barcode) => {
  return product_managerment.findOne({
    where: {
      UPC: barcode,
    },
  });
};

export const findProductWithBars = (barcode) => {
  return product_managerment.findOne({
    where: {
      SKU_product: barcode,
    },
  });
};

export const searchWithSku = (search) => {
  return product_managerment.findOne({
    where: {
      SKU_product: {
        [Op.substring]: search,
      },
    },
    include: [
      {
        association: product_managerment.associations.product_location,
      },
    ],
  });
};

export const findProductWithUPC = (UPC) => {
  return product_managerment.findOne({
    where: {
      UPC: UPC,
    },
  });
};

export const findProductWithUPCEdit = (UPC, SKU) => {
  return product_managerment.findOne({
    where: {
      SKU_product: SKU,
      UPC: UPC,
    },
  });
};

export const findProductWithUPCSEdit = (UPC) => {
  return product_managerment.findAll({
    where: {
      UPC: UPC,
    },
  });
};

export const getProductWithSkus = (sku) => {
  return product_managerment.findOne({
    where: {
      SKU_product: sku,
    },
    include: [
      {
        association: product_managerment.associations.product_location,
      },
    ],
  });
};

export const findProductWithSkuAndUPC = (sku, upc) => {
  return product_managerment.findOne({ where: { SKU_product: sku, UPC: upc } });
};

export const upateUPC = (productId, upc) => {
  return product_managerment.update({ UPC: upc }, { where: { id: productId } });
};

export const findAllCountProduct = () => {
  return product_managerment.count();
};

export const findAllCountProducts = (limit, offset, search) => {
  let query = {};
  if (search !== "") {
    query = {
      SKU_product: {
        [Op.substring]: search,
      },
    };
  }
  return product_managerment.findAll({
    where: query,
    include: [
      {
        association: product_managerment.associations.product_location,
      },
    ],
    order: [["SKU_product", "ASC"]],
    limit,
    offset,
  });
};

export const inventoryRecount = (arrSku: any) => {
  return product_managerment.findAll({
    where: {
      SKU_product: { [Op.in]: arrSku },
    },
    include: [
      {
        association: product_managerment.associations.product_location,
      },
    ],
  });
};

export const allProductInventory = () => {
  return product_managerment.findAll({
    include: [
      {
        association: product_managerment.associations.product_location,
      },
    ],
  });
};
