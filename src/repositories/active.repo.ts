import { active } from "../models/active.model";
import sequelize, { Op, where } from "sequelize";

export const ceateActiveLogin = (workerId) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Login",
    Worker_id: workerId,
    created_at: created,
    updated_at: updated,
    Active: "Login",
  });

  return newActive.save();
};

export const createActiveLogout = (workerId) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "logout",
    Worker_id: workerId,
    created_at: created,
    updated_at: updated,
    Active: "logout",
  });

  return newActive.save();
};

// export const createActiveTransfering = (workerId) => {
//   const created = new Date();
//   const updated = new Date();

//   const newActive = new active({
//     Date: created,
//     Type: "Transfering",
//     Worker_id: workerId,
//     created_at: created,
//     updated_at: updated,
//     Active: "create transfering",
//   });

//   return newActive.save();
// };

export const createActiveTransferingImport = (
  workerId,
  sku,
  quantity,
  fromLocation,
  toLocation
) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Transfering",
    Worker_id: null,
    created_at: created,
    updated_at: updated,
    Active: "import transfering",
    SKU: sku,
    Quantity: quantity,
    from_location: fromLocation,
    to_location: toLocation,
    admin_id: workerId,
  });

  return newActive.save();
};

export const createActiveTransfering = (
  workerId,
  sku,
  quantity,
  fromLocation,
  toLocation,
  workListId,
  workListDetailId
) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Transfering",
    Worker_id: workerId,
    created_at: created,
    updated_at: updated,
    Active: "create transfering",
    SKU: sku,
    Quantity: quantity,
    from_location: fromLocation,
    to_location: toLocation,
    admin_id: null,
    work_list_detail_id: workListDetailId,
    work_list_id: workListId,
  });

  return newActive.save();
};

export const createActiveTransferings = (
  workerId,
  sku,
  quantity,
  fromLocation,
  toLocation
) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Transfering",
    Worker_id: workerId,
    created_at: created,
    updated_at: updated,
    Active: "create transfering",
    SKU: sku,
    Quantity: quantity,
    from_location: fromLocation,
    to_location: toLocation,
    admin_id: null,
  });

  return newActive.save();
};

export const updateActiveTransfering = (
  workerId,
  sku,
  quantity,
  fromLocation,
  toLocation
) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Transfering",
    Worker_id: workerId,
    created_at: created,
    updated_at: updated,
    Active: "update transfering",
    SKU: sku,
    Quantity: quantity,
    from_location: fromLocation,
    to_location: toLocation,
  });

  return newActive.save();
};

export const createActiveReceiving = (
  workerId,
  barCode,
  quantity,
  location,
  workListDetailId,
  workListId
) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Receiving",
    Worker_id: workerId,
    created_at: created,
    updated_at: updated,
    Active: "create Receiving",
    SKU: barCode,
    Quantity: quantity,
    location: location,
    work_list_detail_id: workListDetailId,
    work_list_id: workListId,
  });

  return newActive.save();
};

export const createActiveProduct = (workerId) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Create Product",
    Worker_id: null,
    created_at: created,
    updated_at: updated,
    Active: "create",
    admin_id: workerId,
  });

  return newActive.save();
};

export const createActiveRecevingImport = (workerId, sku, quantity) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Receiving",
    Worker_id: null,
    created_at: created,
    updated_at: updated,
    Active: "import receiving",
    SKU: sku,
    Quantity: quantity,
    admin_id: workerId,
  });

  return newActive.save();
};

export const createActivePickingImport = (workerId, sku, quantity) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Receiving",
    Worker_id: null,
    created_at: created,
    updated_at: updated,
    Active: "import receiving",
    SKU: sku,
    Quantity: quantity,
    admin_id: workerId,
  });

  return newActive.save();
};

export const getAllActive = () => {
  return active.findAll({
    include: [
      {
        association: active.associations.worker_managerment,
      },
      {
        association: active.associations.users,
      },
    ],
  });
};

export const getIdActive = (activeId) => {
  return active.findOne({
    where: {
      id: activeId,
    },
    include: [
      {
        association: active.associations.worker_managerment,
      },
      {
        association: active.associations.users,
      },
    ],
  });
};

export const getActiveWithDate = (data) => {
  return active.findAll({
    where: {
      created_at: {
        [Op.lt]: new Date(
          new Date(data.endDate).getTime() + 60 * 60 * 24 * 1000 - 1
        ),
        [Op.gt]: new Date(data.startDate),
      },
    },
    include: [
      {
        association: active.associations.worker_managerment,
      },
    ],
  });
};

export const findAllCountActive = () => {
  return active.findAndCountAll();
};

export const findAllCountActives = (limit, offset) => {
  return active.findAndCountAll({
    include: [
      {
        association: active.associations.worker_managerment,
      },
    ],
  });
};

export const filterActiveWithType = (type) => {
  if (type === 0) {
    return active.findAll({
      include: [
        {
          association: active.associations.worker_managerment,
        },
      ],
    });
  } else {
    return active.findAll({
      where: {
        Type:
          type === 1
            ? "Login"
            : type === 2
            ? "Receiving"
            : type === 3
            ? "Picking"
            : type === 4
            ? "Transfering"
            : "Inventory",
      },
      include: [
        {
          association: active.associations.worker_managerment,
        },
      ],
    });
  }
};

export const removeActive = (activeId) => {
  return active.destroy({ where: { id: activeId } });
};

export const createActiveInventory = (data) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Inventory",
    Worker_id: null,
    created_at: created,
    updated_at: updated,
    Active: "import file inventory",
    SKU: data.sku,
    Quantity: data.quantity,
    location: data.location,
    admin_id: data.workerId,
    counted_Qty: data.count_qty,
  });

  return newActive.save();
};

export const getProductWithSkuLoc = (sku, loc) => {
  return active.findOne({
    where: {
      SKU: sku,
      location: loc,
    },
  });
};

export const updateQuantity = (activeId, quantity) => {
  const updated = new Date();

  return active.update(
    { Quantity: quantity, updated_at: updated },
    { where: { id: activeId } }
  );
};

export const createActivePicking = (
  workerId,
  barCode,
  quantity,
  location,
  workListDetailId,
  workListId
) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Picking",
    Worker_id: workerId,
    created_at: created,
    updated_at: updated,
    Active: "create Picking",
    SKU: barCode,
    Quantity: quantity,
    location: location,
    work_list_detail_id: workListDetailId,
    work_list_id: workListId,
  });

  return newActive.save();
};

export const createActiveUpdateReceiving = (
  workerId,
  sku,
  quantity,
  location,
  workListDetailId,
  workListId
) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Receiving",
    Worker_id: workerId,
    created_at: created,
    updated_at: updated,
    Active: "update receiving",
    SKU: sku,
    Quantity: quantity,
    location: location,
    work_list_detail_id: workListDetailId,
    work_list_id: workListId,
  });

  return newActive.save();
};

export const createActiveUpdatePicking = (
  workerId,
  sku,
  quantity,
  location,
  workListDetailId,
  workListId
) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Picking",
    Worker_id: workerId,
    created_at: created,
    updated_at: updated,
    Active: "update picking",
    SKU: sku,
    Quantity: quantity,
    location: location,
    work_list_detail_id: workListDetailId,
    work_list_id: workListId,
  });

  return newActive.save();
};

export const createActiveInventoryCount = (userId) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Inventory_count",
    created_at: created,
    updated_at: updated,
    Active: "import file",
    admin_id: userId,
  });

  return newActive.save();
};

export const createActiveInventoryCountCr = (userId) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Inventory_count",
    created_at: created,
    updated_at: updated,
    Active: "create inventory",
    admin_id: userId,
  });

  return newActive.save();
};

export const getTransferActive = () => {
  return active.findAll({
    where: {
      Type: "Transfering",
    },
    order: [["Date", "DESC"]],
  });
};

export const getTransferActiveWithDate = (data) => {
  return active.findAll({
    where: {
      Type: "Transfering",
      Date: {
        [Op.lt]: new Date(
          new Date(data.endDate).getTime() + 60 * 60 * 24 * 1000 - 1
        ),
        [Op.gt]: new Date(data.startDate),
      },
    },
    order: [["Date", "DESC"]],
  });
};

export const ceateActiveInventoryCountCompared = (userId) => {
  const created = new Date();
  const updated = new Date();

  const newActive = new active({
    Date: created,
    Type: "Inventory count",
    created_at: created,
    updated_at: updated,
    Active: "update quantity all product in location",
    admin_id: userId,
  });

  return newActive.save();
};

export const createActiveEditPalletAdminAdd = (userId, data) => {
  const date = new Date();

  const newActive = new active({
    Date: date,
    Type: "inventory_pallet",
    created_at: date,
    updated_at: date,
    Active: "edit pallet admin",
    SKU: data.sku,
    location: data.location,
    admin_id: userId,
  });

  return newActive.save();
};

export const createActiveEditPalletAdminDelete = (userId, data) => {
  const date = new Date();

  const newActive = new active({
    Date: date,
    Type: "inventory_pallet",
    created_at: date,
    updated_at: date,
    Active: "delete pallet admin",
    SKU: data.sku,
    location: data.location,
    admin_id: userId,
  });

  return newActive.save();
};
