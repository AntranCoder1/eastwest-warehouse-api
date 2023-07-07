import { active } from "./../models/active.model";
import { work_list_detail } from "../models/work_list_detail.model";
import { inventory_pallet } from "../models/inventory_pallet.model";
import sequelize, { Op, where } from "sequelize";

export const createNewWorkListDetailReceiving = (arrProduct, workListId) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListDetail = new work_list_detail({
    work_list_id: workListId,
    SKU: arrProduct.SKU,
    Quantity: arrProduct.Quantity,
    created_at: created,
    updated_at: updated,
    location: arrProduct.location,
    Container_Number: arrProduct["Container Number"],
  });
  return newWorkListDetail.save();
};

export const createNewWorkListDetailPicking = (arrProduct, id, workListId) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListDetail = new work_list_detail({
    work_list_id: id,
    SKU: arrProduct["Work List ID"],
    Quantity: arrProduct[workListId],
    created_at: created,
    updated_at: updated,
  });
  return newWorkListDetail.save();
};

export const createNewWorkListDetailPickingLTL = (arrProduct, workListId) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListDetail = new work_list_detail({
    work_list_id: workListId,
    SKU: arrProduct.SKU,
    Quantity: arrProduct.Qty,
    created_at: created,
    updated_at: updated,
  });
  return newWorkListDetail.save();
};

export const getWorkListDetailId = (workListDetailId) => {
  return work_list_detail.findOne({
    where: {
      id: workListDetailId,
    },
  });
};

export const editWorkListReceiving = (
  workListDetailId,
  SKU,
  Quantity,
  containerNumber
) => {
  const updated = new Date();

  return work_list_detail.update(
    {
      SKU: SKU,
      Quantity: Quantity,
      updated_at: updated,
      Container_Number: containerNumber,
    },
    { where: { id: workListDetailId } }
  );
};

export const deleteWorkListReceiving = (workListDetailId) => {
  return work_list_detail.destroy({ where: { id: workListDetailId } });
};

export const createWorkListDetail = (workListId, sku, containerNumber) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListDetail = new work_list_detail({
    work_list_id: workListId,
    SKU: sku.SKU,
    Quantity: sku.quantity,
    created_at: created,
    updated_at: updated,
    Container_Number: containerNumber,
  });

  return newWorkListDetail.save();
};

// export const getWorklistWithSku = (sku) => {
//   return work_list_detail.findOne({
//     where: {
//       SKU: sku,
//     },
//   });
// };

export const getWorklistWithSku = (sku, workListId) => {
  return work_list_detail.findOne({
    where: {
      SKU: sku,
      work_list_id: workListId,
    },
  });
};

export const getWorklistWithSkuNull = (sku, from, to) => {
  return work_list_detail.findOne({
    where: {
      SKU: sku,
      fromLocation: from,
      toLocation: to,
    },
  });
};

export const updateQuantityReceiving = (
  workListDetailId,
  quantity,
  location
) => {
  const updated = new Date();

  return work_list_detail.update(
    { location: location, quantity_transfer: quantity, updated_at: updated },
    { where: { id: workListDetailId } }
  );
};

export const updateQuantity = (workListDetailId, quantity) => {
  const updated = new Date();

  return work_list_detail.update(
    { quantity_transfer: quantity, updated_at: updated },
    { where: { id: workListDetailId } }
  );
};

export const updateQuantityPicking = (workListDetailId, quantity, location) => {
  const updated = new Date();

  return work_list_detail.update(
    { location: location, quantity_transfer: quantity, updated_at: updated },
    { where: { id: workListDetailId } }
  );
};

export const updateStatus = (workListDetailId) => {
  const updated = new Date();

  return work_list_detail.update(
    { status: "complete", updated_at: updated },
    { where: { id: workListDetailId } }
  );
};

export const updateStatusWorking = (workListDetailId) => {
  const updated = new Date();

  return work_list_detail.update(
    { status: "working", updated_at: updated },
    { where: { id: workListDetailId } }
  );
};

export const getReceivingDetail = (workListDetailId) => {
  return work_list_detail.findOne({
    where: {
      id: workListDetailId,
    },
    include: [
      {
        model: active,
        as: "active",
        order: [["created_at", "DESC"]],
      },
      {
        association: work_list_detail.associations.product_managerment,
      },
    ],
  });
};

export const getTransferDetail = (workListDetailId) => {
  return work_list_detail.findAll({
    where: {
      [Op.and]: [
        {
          id: workListDetailId,
          "$active.Active$": "update transfering",
        },
      ],
      // id: workListDetailId,
    },
    include: [
      {
        association: work_list_detail.associations.active,
      },
      {
        association: work_list_detail.associations.product_managerment,
      },
    ],
  });
};

export const getWorkListPickingWithSku = (workListDetailId) => {
  return work_list_detail.findOne({
    where: {
      id: workListDetailId,
    },
  });
};

export const createNewWorkListDetailTransfer = (arrProduct, id) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListDetail = new work_list_detail({
    work_list_id: id,
    SKU: arrProduct.SKU,
    Quantity: arrProduct.QTY,
    created_at: created,
    updated_at: updated,
    fromLocation: arrProduct.FROM,
    toLocation: arrProduct.TO,
  });
  return newWorkListDetail.save();
};

export const getQRLocationFrom = (workListDetaiId, location) => {
  return work_list_detail.findOne({
    where: {
      id: workListDetaiId,
      fromLocation: location,
    },
  });
};

export const getQRLocationTo = (workListDetaiId, location) => {
  return work_list_detail.findOne({
    where: {
      id: workListDetaiId,
      toLocation: location,
    },
  });
};

export const increaseQuantity = (workListDetailId, quantity) => {
  const updated = new Date();

  return work_list_detail.update(
    { quantity_transfer: quantity, updated_at: updated },
    { where: { id: workListDetailId } }
  );
};

export const createInvent = (workListId, arrInvent) => {
  const created = new Date();
  const updated = new Date();

  const arr = [];

  for (const i of arrInvent) {
    const newInvent = {
      work_list_id: workListId,
      SKU: i.SKU,
      created_at: created,
      updated_at: updated,
      QBQty: i.QBQty,
      Qty_from_app: i.Qty_from_app,
      Counted_Qty: i.Counted_Qty,
    };

    arr.push(newInvent);
  }

  return work_list_detail.bulkCreate(arr);
};

export const updateQuantitys = (workListId, Sku, quantity) => {
  return work_list_detail.update(
    { Counted_Qty: quantity },
    { where: { work_list_id: workListId, SKU: Sku } }
  );
};

export const getWorkListDetailIdInventory = (workListId, sku) => {
  return work_list_detail.findOne({
    where: { work_list_id: workListId, SKU: sku },
  });
};

export const updateQtyFrom = (workListId, Sku, quantity) => {
  return work_list_detail.update(
    { Qty_from_app: quantity },
    { where: { work_list_id: workListId, SKU: Sku } }
  );
};

export const getWorkListDetailActive = (workListDetailId, sku) => {
  return work_list_detail.findOne({
    where: {
      id: workListDetailId,
      SKU: sku,
    },
    include: [
      {
        model: active,
        as: "active",
        order: [["created_at", "DESC"]],
      },
    ],
  });
};

export const inventoryPallet = (
  workListId: number,
  workListDetailId: number,
  sku: string
) => {
  return work_list_detail.findAll({
    where: {
      [Op.and]: [
        {
          id: workListDetailId,
          "$inventory_pallet.work_list_detail_id$": workListDetailId,
          // "$inventory_pallet.work_list_id$": workListId,
          // "$inventory_pallet.sku$": sku,
        },
      ],
    },
    include: [
      {
        association: work_list_detail.associations.inventory_pallet,
      },
    ],
  });
};

export const findInventoryWithWorklistId = (
  worklistId: number,
  page: number,
  pageSize: number,
  search: string
) => {
  if (search === "") {
    return work_list_detail.findAll({
      where: {
        [Op.and]: [
          {
            work_list_id: worklistId,
          },
        ],
      },
      limit: pageSize,
      offset: page * pageSize,
    });
  } else {
    return work_list_detail.findAll({
      where: {
        [Op.and]: [
          {
            work_list_id: worklistId,
            SKU: {
              [Op.substring]: search,
            },
          },
        ],
      },
    });
  }
};

export const countDocument = (worklistId: number, search: string) => {
  if (search === "") {
    return work_list_detail.count({
      where: {
        [Op.and]: [
          {
            work_list_id: worklistId,
          },
        ],
      },
    });
  } else {
    return work_list_detail.count({
      where: {
        [Op.and]: [
          {
            work_list_id: worklistId,
            SKU: {
              [Op.substring]: search,
            },
          },
        ],
      },
    });
  }
};
