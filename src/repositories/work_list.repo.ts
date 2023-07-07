import { work_list } from "../models/work_list.model";
import sequelize, { Op, where } from "sequelize";
import { product_transfer } from "../models/product_transfer.models";
import { work_list_detail } from "../models/work_list_detail.model";

export const createNewWorkListReceiving = (userId) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListReceiving = new work_list({
    Type: "Receiving",
    Date: created,
    Status: "Pending",
    created_at: created,
    updated_at: updated,
    worker_managerment_id: userId,
  });
  return newWorkListReceiving.save();
};

export const searchReceiving = (containerNumber) => {
  let query = {};
  if (containerNumber !== "") {
    query = {
      Container_Number: {
        [Op.substring]: containerNumber,
      },
      Type: "Receiving",
    };
  }
  return work_list.findAll({
    where: query,
  });
};

export const searchPicking = (containerNumber) => {
  let query = {};
  if (containerNumber !== "") {
    query = {
      Container_Number: {
        [Op.substring]: containerNumber,
      },
      Type: "Picking",
    };
  }
  return work_list.findAll({
    where: query,
  });
};

export const getAll = (type) => {
  return work_list.findAll({
    where: {
      Type: type,
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const getAllReceiving = () => {
  return work_list.findAll({
    where: {
      Type: "Receiving",
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
      {
        association: work_list.associations.users,
      },
    ],
    order: [["Date", "DESC"]],
  });
};

export const getAllPicking = () => {
  return work_list.findAll({
    where: {
      Type: "Picking",
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
      {
        association: work_list.associations.users,
      },
    ],
    order: [["Date", "DESC"]],
  });
};

export const getAllTransfering = () => {
  return work_list.findAll({
    where: {
      Type: "Transfering",
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const findById = (workListId) => {
  return work_list.findAll({
    where: {
      [Op.and]: [
        {
          id: workListId,
          "$work_list_detail.work_list_id$": workListId,
          Type: "Receiving",
        },
      ],
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const importWorkList = (userId, container) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListReceiving = new work_list({
    Type: "Receiving",
    Date: created,
    Status: "Pending",
    created_at: created,
    updated_at: updated,
    worker_managerment_id: userId,
    Container_Number: container,
  });
  return newWorkListReceiving.save();
};

export const createNewWorkListPicking = (userId) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListReceiving = new work_list({
    Type: "Picking",
    Date: created,
    Status: "Pending",
    created_at: created,
    updated_at: updated,
    worker_managerment_id: userId,
  });
  return newWorkListReceiving.save();
};

export const createImportWorkListPickingLTL = (
  userId,
  workListId,
  sku,
  quantity,
  workListPickingLtlId
) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListReceiving = new work_list({
    Type: "Picking",
    Date: created,
    Status: "Pending",
    created_at: created,
    updated_at: updated,
    worker_managerment_id: userId,
    Container_Number: workListId,
    SKU_pickingLTL: sku,
    Quantity_pickingLTL: quantity,
    picking_type: "picking_ltl",
    workListPickingltlId: workListPickingLtlId,
    statusLTL: "working",
  });
  return newWorkListReceiving.save();
};

export const findByIdPicking = (workListId) => {
  return work_list.findAll({
    where: {
      [Op.and]: [
        {
          id: workListId,
          "$work_list_detail.work_list_id$": workListId,
          Type: "Picking",
        },
      ],
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const importWorkListPicking = (userId, containerNumber) => {
  const created = new Date();
  const updated = new Date();
  const newWorkListReceiving = new work_list({
    Type: "Picking",
    Date: created,
    Status: "Pending",
    created_at: created,
    updated_at: updated,
    worker_managerment_id: userId,
    Container_Number: containerNumber,
    picking_type: "picking_ground",
  });
  return newWorkListReceiving.save();
};

export const createNewWorkListTransfering = (userId) => {
  const created = new Date();
  const updated = new Date();

  const newWorkListReceiving = new work_list({
    Type: "Transfering",
    Date: created,
    Status: "Working",
    created_at: created,
    updated_at: updated,
    worker_managerment_id: null,
    user: userId,
  });
  return newWorkListReceiving.save();
};

export const getAllTransfer = (type) => {
  return work_list.findAll({
    where: {
      Type: type,
    },
    include: [
      {
        association: work_list.associations.product_transfer,
      },
    ],
  });
};

export const getTransferById = (transferId) => {
  return work_list.findOne({
    where: {
      Type: "Transfering",
      id: transferId,
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const getWorkListId = (workListId) => {
  return work_list.findOne({
    where: { id: workListId },
  });
};

export const getReceivingWithDate = (data) => {
  return work_list.findAll({
    where: {
      Type: "Receiving",
      Date: {
        [Op.lt]: new Date(
          new Date(data.endDate).getTime() + 60 * 60 * 24 * 1000 - 1
        ),
        [Op.gt]: new Date(data.startDate),
      },
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
      {
        association: work_list.associations.users,
      },
    ],
  });
};

export const getPickingWithDate = (data) => {
  return work_list.findAll({
    where: {
      Type: "Picking",
      Date: {
        [Op.lt]: new Date(
          new Date(data.endDate).getTime() + 60 * 60 * 24 * 1000 - 1
        ),
        [Op.gt]: new Date(data.startDate),
      },
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
      {
        association: work_list.associations.users,
      },
    ],
  });
};

export const getTransferingWithDate = (data) => {
  return work_list.findAll({
    where: {
      Type: "Transfering",
      Date: {
        [Op.lt]: new Date(
          new Date(data.endDate).getTime() + 60 * 60 * 24 * 1000 - 1
        ),
        [Op.gt]: new Date(data.startDate),
      },
    },
    include: [
      {
        association: work_list.associations.product_transfer,
      },
    ],
  });
};

export const getTransferringWithDate = (data) => {
  return work_list.findAll({
    where: {
      Type: "Transfering",
      Date: {
        [Op.lt]: new Date(
          new Date(data.endDate).getTime() + 60 * 60 * 24 * 1000 - 1
        ),
        [Op.gt]: new Date(data.startDate),
      },
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
      {
        association: work_list.associations.users,
      },
    ],
  });
};

export const updateContainerNumber = (workListId, containerNumber) => {
  const updated = new Date();

  return work_list.update(
    { Container_Number: containerNumber, updated_at: updated },
    { where: { id: workListId } }
  );
};

export const filterPickingWithType = () => {
  return work_list.findAll({
    where: {
      picking_type: "picking_ground",
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
  // if (type === 0) {
  //   return work_list.findAll({
  //     where: {
  //       Type: "Picking",
  //     },
  //     include: [
  //       {
  //         association: work_list.associations.work_list_detail,
  //       },
  //     ],
  //   });
  // } else {
  //   return work_list.findAll({
  //     where: {
  //       Type: "Picking",
  //       picking_type:
  //         type === 1 ? "picking_ground" : type === 2 ? "picking_ltl" : "",
  //     },
  //     include: [
  //       {
  //         association: work_list.associations.work_list_detail,
  //       },
  //     ],
  //   });
  // }
};

export const findSku = () => {
  return work_list.findAll({
    where: {
      Type: "Receiving",
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const updateStatus = (workListId) => {
  const updated = new Date();

  return work_list.update(
    { Status: "complete", updated_at: updated },
    { where: { id: workListId } }
  );
};

export const updateStatusWorking = (workListId) => {
  const updated = new Date();

  return work_list.update(
    { Status: "working", updated_at: updated },
    { where: { id: workListId } }
  );
};

export const getWorkListSku = (workListId) => {
  return work_list.findOne({
    where: {
      id: workListId,
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const importTransfering = (workerId, container) => {
  const created = new Date();
  const updated = new Date();

  const create = new work_list({
    Type: "Transfering",
    Date: created,
    Status: "working",
    created_at: created,
    updated_at: updated,
    worker_managerment_id: workerId,
    Container_Number: container,
  });

  return create.save();
};

export const getQRLocationFrom = (workListId, location) => {
  return work_list.findAll({
    where: {
      [Op.and]: [
        {
          id: workListId,
          "$work_list_detail.work_list_id$": workListId,
          "$work_list_detail.fromLocation$": location,
        },
      ],
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const getQRLocationTo = (workListId, location) => {
  return work_list.findAll({
    where: {
      [Op.and]: [
        {
          id: workListId,
          "$work_list_detail.work_list_id$": workListId,
          "$work_list_detail.toLocation$": location,
        },
      ],
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const getProductTransfer = (worklistId) => {
  return work_list.findAll({
    where: {
      [Op.and]: [
        {
          id: worklistId,
          "$product_transfer.work_list_id$": worklistId,
        },
      ],
    },
    include: [
      {
        association: work_list.associations.product_transfer,
      },
    ],
  });
};

export const createInvent = (usersId: any, title: any, desc: any) => {
  const created = new Date();
  const updated = new Date();

  const create = new work_list({
    Type: "Inventory_count",
    Date: created,
    Status: "working",
    created_at: created,
    updated_at: updated,
    worker_managerment_id: usersId,
    Title_invent: title,
    desc_invent: desc,
  });

  return create.save();
};

export const findInvent = () => {
  return work_list.findAll({
    where: {
      Type: "Inventory_count",
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
    order: [["created_at", "DESC"]],
  });
};

export const findInventPagination = (page: number, pageSize: number) => {
  if (!!page && !!pageSize) {
    return work_list.findAll({
      where: {
        Type: "Inventory_count",
      },
      // include: [
      //   {
      //     association: work_list.associations.work_list_detail,
      //   },
      // ],
      limit: page,
      offset: pageSize,
      order: [["created_at", "DESC"]],
    });
  } else {
    return work_list.findAll({
      where: {
        Type: "Inventory_count",
      },
      // include: [
      //   {
      //     association: work_list.associations.work_list_detail,
      //   },
      // ],
      order: [["created_at", "DESC"]],
    });
  }
};

export const countDocument = () => {
  return work_list.count({
    where: {
      Type: "Inventory_count",
    },
    // include: [
    //   {
    //     association: work_list.associations.work_list_detail,
    //   },
    // ],
  });
};

export const findInvents = () => {
  return work_list.findAll({
    where: {
      Type: "Inventory_count",
      Status: "working",
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const findInventId = (inventId: number) => {
  return work_list.findOne({
    where: {
      id: inventId,
      Type: "Inventory_count",
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const searchInvent = (
  inventId: number,
  search: string,
  page: number,
  pageSize: number
) => {
  if (search === "") {
    return work_list.findOne({
      where: {
        id: inventId,
        Type: "Inventory_count",
      },
      include: [
        {
          model: work_list_detail,
          as: "work_list_detail",
          where: {
            work_list_id: inventId,
          },
        },
      ],
    });
  } else {
    return work_list.findOne({
      where: {
        id: inventId,
        Type: "Inventory_count",
      },
      include: [
        {
          model: work_list_detail,
          as: "work_list_detail",
          where: {
            SKU: {
              [Op.substring]: search,
            },
            work_list_id: inventId,
          },
        },
      ],
    });
  }
};

// export const searchInvent = (
//   inventId: number,
//   search: string,
//   page: number,
//   pageSize: number
// ) => {
//   const limit = pageSize;
//   const offset = page * pageSize;

//   const where = {
//     id: inventId,
//     Type: "Inventory_count",
//   };

//   const include = [
//     {
//       model: work_list_detail,
//       as: "work_list_detail",
//       where: {
//         work_list_id: inventId,
//       },
//       through: {
//         attributes: ["id", "work_list_id", "SKU", "Quantity"],
//         limit,
//         offset,
//       },
//     },
//   ];

//   if (search !== "") {
//     where["$work_list_detail.SKU$"] = { [Op.substring]: search };
//   }

//   return work_list.findOne({
//     where,
//     include,
//   });
// };

export const deleteInventory = (inventId) => {
  return work_list.destroy({ where: { id: inventId } });
};

export const findInventIds = (inventId) => {
  return work_list.findAll({
    where: {
      [Op.and]: [
        {
          id: inventId,
          Type: "Inventory_count",
          "$work_list_detail.work_list_id$": inventId,
        },
      ],
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const updateWorkList = (workListId, title, desc) => {
  return work_list.update(
    { Title_invent: title, desc_invent: desc },
    { where: { id: workListId } }
  );
};

export const filterInventWithYear = (year) => {
  return work_list.findAll({
    where: {
      [Op.and]: [
        {
          updated_at: sequelize.where(
            sequelize.fn("YEAR", sequelize.col("work_list.updated_at")),
            year
          ),
        },
        { Type: "Inventory_count" },
      ],
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const getWorkListWithWorkListPickingLTLID = (id: number) => {
  return work_list.findAll({
    where: {
      workListPickingltlId: id,
    },
    include: [
      {
        association: work_list.associations.work_list_detail,
      },
    ],
  });
};

export const updateStatusLTL = (workListId: number, number: number) => {
  let status = "";
  if (number === 1) {
    status = "complete";
  }
  if (number === 2) {
    status = "working";
  }
  return work_list.update({ statusLTL: status }, { where: { id: workListId } });
};
