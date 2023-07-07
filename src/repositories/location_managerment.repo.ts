import { search } from "./product_location.repo";
import { location_managermenrt } from "../models/location_managermenrt.model";
import { product_managerment } from "../models/product_managerment.model";
import sequelize, { Op } from "sequelize";
import { product_location } from "../models/product_location.models";

export const createLocation = (data) => {
  const created = new Date();
  const updated = new Date();

  const newLocation = new location_managermenrt({
    Loc_Barcodes: data.locBarcodes,
    Position: data.position,
    created_at: created,
    updated_at: updated,
    limit_size: data.limit_size,
  });
  return newLocation.save();
};

export const updateLocation = (locationId, data) => {
  return location_managermenrt.update(
    {
      Loc_Barcodes: data.locBarcodes,
      Position: data.position,
      limit_size: data.limit,
    },
    { where: { id: locationId } }
  );
};

// export const getLocationId = (locationId) => {
//   return location_managermenrt.findOne({ where: { id: locationId } });
// };

export const seachName = (Loc_Barcodes) => {
  let query = {};
  if (Loc_Barcodes !== "") {
    query = {
      Loc_Barcodes: {
        [Op.substring]: Loc_Barcodes,
      },
    };
  }
  return location_managermenrt.findAll({
    where: query,
    include: [
      {
        association: location_managermenrt.associations.product_location,
      },
    ],
  });
};

export const findAlls = () => {
  return location_managermenrt.findAll({
    include: [
      {
        association: location_managermenrt.associations.product_location,
        include: [
          {
            model: product_managerment,
            as: "product_managerment",
            where: { isDeleted: 0 || null },
          },
        ],
      },
    ],
    order: [["Loc_Barcodes", "ASC"]],
  });
};

// export const getLocationId = (locationId) => {
//   return location_managermenrt.findAll({
//     where: {
//       [Op.and]: [
//         {
//           id: locationId,
//           "$location_list_managerment.location_managerment_id$": locationId,
//         },
//       ],
//     },
//     include: [
//       {
//         association:
//           location_managermenrt.associations.location_list_managerment,
//       },
//     ],
//   });
// };

export const getLocationId = (locationId) => {
  return location_managermenrt.findOne({
    where: {
      id: locationId,
    },
    include: [
      {
        association: location_managermenrt.associations.product_location,
      },
    ],
  });
};

export const deleteLocation = (locationId) => {
  return location_managermenrt.destroy({ where: { id: locationId } });
};

export const deleteLocationProduct = (locationId) => {
  return location_managermenrt.destroy({
    where: { id: { [Op.in]: locationId } },
  });
};

export const importFile = (data) => {
  const created = new Date();
  const updated = new Date();

  const newLocation = new location_managermenrt({
    Loc_Barcodes: data.Location,
    Position: data.Position,
    created_at: created,
    updated_at: updated,
  });
  return newLocation.save();
};

// export const filterLo = (location) => {
//   return location_managermenrt.findAll({
//     where: {
//       Location_List_id: {
//         [Op.eq]: location,
//       },
//     },
//     order: [["Location", "ASC"]],
//   });
// };

export const createLocationProduct = (arrLocation, productId, quantity) => {
  const created = new Date();
  const updated = new Date();

  const arrLocations = [];

  for (const i of arrLocation) {
    const location = {
      Loc_Barcodes: i.location,
      created_at: created,
      updated_at: updated,

      product_managerment_id: productId,
      Quantity: quantity,
    };

    arrLocations.push(location);
  }

  return location_managermenrt.bulkCreate(arrLocations);
};

export const updateLocationProduct = (data) => {
  const updated = new Date();

  const ids = data.map((item) => item.id);

  for (const i of data) {
    const location = {
      Loc_Barcodes: i.location,
    };
    return location_managermenrt.update(location, {
      where: { id: { [Op.in]: ids } },
    });
  }
};

// export const updateQuantity = (quantity, location, productId) => {
//   const updated = new Date();

//   console.log("productId", productId);

//   return location_managermenrt.update(
//     { Quantity: quantity, updated_at: updated },
//     { where: { Loc_Barcodes: location, product_managerment_id: productId } }
//   );
// };

// export const updateQuantityTransfer = (quantity, location) => {
//   const updated = new Date();

//   return location_managermenrt.update(
//     { Quantity: quantity, updated_at: updated },
//     { where: { Loc_Barcodes: location } }
//   );
// };

export const findWithBarcode = (locbarcode, productId) => {
  return location_managermenrt.findOne({
    where: { Loc_Barcodes: locbarcode },
  });
};

// export const updateProductTransferFrom = (
//   totalAmountAfterMoving,
//   productId,
//   formLocationBarcode
// ) => {
//   return location_managermenrt.update(
//     { Quantity: totalAmountAfterMoving },
//     {
//       where: {
//         product_managerment_id: productId,
//         Loc_Barcodes: formLocationBarcode,
//       },
//     }
//   );
// };

// export const createProductTransferTo = (
//   data,
//   productId,
//   totalAmountAfterAdd,
//   transferId,
//   productManagermentId
// ) => {
//   const created = new Date();
//   const updated = new Date();

//   const newProductTransfer = new location_managermenrt({
//     Loc_Barcodes: data.toLocationBarcode,
//     created_at: created,
//     updated_at: updated,
//     product_transfer_id: productId,
//     Quantity_Transfer: totalAmountAfterAdd,
//     transfer_product_id: transferId,
//   });

//   return newProductTransfer.save();
// };

export const getLocationWithLoc = (loc) => {
  return location_managermenrt.findOne({ where: { Loc_Barcodes: loc } });
};

export const findAllCountLocation = () => {
  return location_managermenrt.count();
};

export const findAllCountLocations = (limit, offset, search) => {
  let query = {};
  if (search !== "") {
    query = {
      Loc_Barcodes: {
        [Op.substring]: search,
      },
    };
  }
  return location_managermenrt.findAll({
    where: query,
    include: [
      {
        association: location_managermenrt.associations.product_location,
      },
    ],
    order: [["Loc_Barcodes", "ASC"]],
    limit,
    offset,
  });
};

export const searchWithLoc = (search) => {
  return location_managermenrt.findOne({
    where: {
      Loc_Barcodes: {
        [Op.substring]: search,
      },
    },
    include: [
      {
        association: location_managermenrt.associations.product_location,
      },
    ],
  });
};

export const getAlls = () => {
  return location_managermenrt.findAll();
};

export const getCountByLoc = async (
  arrLocId: any,
  arrSkuId: any,
  pageSize: number,
  page: number
) => {
  console.log(arrSkuId);

  const limit = pageSize;
  const offset = page * pageSize;
  console.log(limit);
  console.log(offset);

  const data: any = await location_managermenrt.findAll({
    offset,
    limit,
    order: [["Loc_Barcodes", "ASC"]],
    subQuery: false,
    where: {
      [Op.and]: [
        {
          id: { [Op.in]: arrLocId },
          // "$product_location.product_managerment_id$": { [Op.in]: arrSkuId },
        },
      ],
    },
    // include: [
    //   {
    //     model: product_location,
    //     as: "product_location",
    //     required: false,
    //   }, // đẹch đủ 10 rôi mà em phải tách ra nữa , cai any la êm lam theo cai mau ma khách đưa cho nên em mơi làm ra để đổ cho đúng thì em phải query ngược lại chớ
    // ],
  });

  return data;
};

export const countDocument = (arrLocId: any) => {
  return location_managermenrt.count({
    where: {
      [Op.and]: [
        {
          id: { [Op.in]: arrLocId },
          // "$product_location.product_managerment_id$": { [Op.in]: arrSkuId },
        },
      ],
    },
  });
};
