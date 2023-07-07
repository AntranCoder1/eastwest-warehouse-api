import type { Sequelize, Model, ModelType } from "sequelize";
import { users } from "./users.model";
import type { usersAttributes, usersCreationAttributes } from "./users.model";
import { worker_managerment } from "./worker_managerment.model";
import type {
  worker_managermentAttributes,
  worker_managermentCreationAttributes,
} from "./worker_managerment.model";
import { product_managerment } from "./product_managerment.model";
import type {
  product_managermentAttributes,
  product_managermentCreationAttributes,
} from "./product_managerment.model";
import { location_managermenrt } from "./location_managermenrt.model";
import type {
  location_managermenrtAttributes,
  location_managermenrtCreationAttributes,
} from "./location_managermenrt.model";
import { location_list_managerment } from "../models/location_list_managerment.model";
import type {
  location_list_managermentAttributes,
  location_list_managermentCreationAttributes,
} from "../models/location_list_managerment.model";
import { work_list } from "./work_list.model";
import type {
  work_listAttributes,
  work_listCreationAttributes,
} from "./work_list.model";
import { work_list_detail } from "./work_list_detail.model";
import type {
  work_list_detailAttributes,
  work_list_detailCreationAttributes,
} from "./work_list_detail.model";
import { product_transfer } from "./product_transfer.models";
import type {
  product_transferAttributes,
  product_transferCreationAttributes,
} from "./product_transfer.models";
import { active } from "./active.model";
import type {
  activeAttributes,
  activeCreationAttributes,
} from "./active.model";
import { product_location } from "./product_location.models";
import type {
  product_locationAttributes,
  product_locationCreationAttributes,
} from "./product_location.models";
import { work_list_pickingltl } from "./work_list_pickingltl.model";
import type {
  work_list_pickingltlAttributes,
  work_list_pickingltlCreationAttributes,
} from "./work_list_pickingltl.model";
import { inventory_count } from "./inventory_count.model";
import type {
  inventory_countAttributes,
  inventory_countCreationAttributes,
} from "./inventory_count.model";
import { inventory_scan } from "./inventory_scan.model";
import type {
  inventory_scanAttributes,
  inventory_scanCreationAttributes,
} from "./inventory_scan.model";
import { adjustment } from "./adjustment.model";
import type {
  adjustmentAttributes,
  adjustmentCreationAttributes,
} from "./adjustment.model";
import { inventory_pallet } from "./inventory_pallet.model";
import type {
  inventory_palletAttributes,
  inventory_palletCreationAttributes,
} from "./inventory_pallet.model";
import { active_pallet } from "./active_pallet.model";
import type {
  active_palletAttributes,
  active_palletCreationAttributes,
} from "./active_pallet.model";
import { product_managerment_image } from "./product_managerment_image.model";
import type {
  product_managerment_imageAttributes,
  product_managerment_imageCreationAttributes,
} from "./product_managerment_image.model";

export {
  users,
  worker_managerment,
  product_managerment,
  location_managermenrt,
  location_list_managerment,
  work_list,
  work_list_detail,
  product_transfer,
  active,
  product_location,
  work_list_pickingltl,
  inventory_count,
  inventory_scan,
  adjustment,
  inventory_pallet,
  active_pallet,
  product_managerment_image,
};

export type {
  usersAttributes,
  usersCreationAttributes,
  worker_managermentAttributes,
  worker_managermentCreationAttributes,
  product_managermentAttributes,
  product_managermentCreationAttributes,
  location_managermenrtAttributes,
  location_managermenrtCreationAttributes,
  location_list_managermentAttributes,
  location_list_managermentCreationAttributes,
  work_listAttributes,
  work_listCreationAttributes,
  work_list_detailAttributes,
  work_list_detailCreationAttributes,
  product_transferAttributes,
  product_transferCreationAttributes,
  activeAttributes,
  activeCreationAttributes,
  product_locationAttributes,
  product_locationCreationAttributes,
  work_list_pickingltlAttributes,
  work_list_pickingltlCreationAttributes,
  inventory_countAttributes,
  inventory_countCreationAttributes,
  inventory_scanAttributes,
  inventory_scanCreationAttributes,
  adjustmentAttributes,
  adjustmentCreationAttributes,
  inventory_palletAttributes,
  inventory_palletCreationAttributes,
  active_palletAttributes,
  active_palletCreationAttributes,
  product_managerment_imageAttributes,
  product_managerment_imageCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  users.initModel(sequelize);
  worker_managerment.initModel(sequelize);
  product_managerment.initModel(sequelize);
  location_managermenrt.initModel(sequelize);
  location_list_managerment.initModel(sequelize);
  work_list.initModel(sequelize);
  work_list_detail.initModel(sequelize);
  product_transfer.initModel(sequelize);
  active.initModel(sequelize);
  product_location.initModel(sequelize);
  work_list_pickingltl.initModel(sequelize);
  inventory_count.initModel(sequelize);
  inventory_scan.initModel(sequelize);
  adjustment.initModel(sequelize);
  inventory_pallet.initModel(sequelize);
  active_pallet.initModel(sequelize);
  product_managerment_image.initModel(sequelize);

  // location_managermenrt.hasMany(location_list_managerment, {
  //   as: "location_list_managerment",
  //   foreignKey: "location_managerment_id",
  // });
  // location_list_managerment.belongsTo(location_managermenrt, {
  //   as: "location_managermenrt",
  //   foreignKey: "location_managerment_id",
  // });
  work_list.belongsTo(worker_managerment, {
    as: "worker_managerment",
    foreignKey: "user",
  });
  worker_managerment.hasMany(work_list, {
    as: "work_list",
    foreignKey: "user",
  });
  work_list.hasMany(work_list_detail, {
    as: "work_list_detail",
    foreignKey: "work_list_id",
  });
  work_list_detail.belongsTo(work_list, {
    as: "work_list",
    foreignKey: "work_list_id",
  });
  product_managerment.hasMany(location_list_managerment, {
    as: "location_list_managerment",
    foreignKey: "product_managerment_id",
  });
  location_list_managerment.belongsTo(product_managerment, {
    as: "product_managerment",
    foreignKey: "product_managerment_id",
  });
  // product_managerment.hasMany(location_managermenrt, {
  //   as: "location_managermenrt",
  //   foreignKey: "product_managerment_id",
  // });
  // location_managermenrt.belongsTo(product_managerment, {
  //   as: "product_managerment",
  //   foreignKey: "product_managerment_id",
  // });
  // product_managerment.hasMany(location_managermenrt, {
  //   as: "location_managermenrt_",
  //   foreignKey: "product_transfer_id",
  // });
  // location_managermenrt.belongsTo(product_managerment, {
  //   as: "product_managerment_",
  //   foreignKey: "product_transfer_id",
  // });
  product_managerment.hasMany(product_transfer, {
    as: "product_transfer",
    foreignKey: "product_Id",
  });
  product_transfer.belongsTo(product_managerment, {
    as: "product_managerment",
    foreignKey: "product_Id",
  });
  work_list.hasMany(product_transfer, {
    as: "product_transfer",
    foreignKey: "work_list_id",
  });
  product_transfer.belongsTo(work_list, {
    as: "work_list",
    foreignKey: "work_list_id",
  });
  // product_transfer.hasMany(location_managermenrt, {
  //   as: "location_managermenrt",
  //   foreignKey: "transfer_product_id",
  // });
  // location_managermenrt.belongsTo(product_transfer, {
  //   as: "product_transfer",
  //   foreignKey: "transfer_product_id",
  // });
  worker_managerment.hasMany(active, {
    as: "active",
    foreignKey: "Worker_id",
  });
  active.belongsTo(worker_managerment, {
    as: "worker_managerment",
    foreignKey: "Worker_id",
  });
  users.hasMany(active, {
    as: "active",
    foreignKey: "admin_id",
  });
  active.belongsTo(users, {
    as: "users",
    foreignKey: "admin_id",
  });
  // location_managermenrt.belongsTo(location_list_managerment, {
  //   as: "location_list_managerment_",
  //   foreignKey: "Location_List_id",
  // });
  // location_list_managerment.belongsTo(location_managermenrt, {
  //   as: "location_managermenrt_",
  //   foreignKey: "Location_List_id",
  // });
  product_managerment.hasMany(product_location, {
    as: "product_location",
    foreignKey: "product_managerment_id",
  });
  product_location.belongsTo(product_managerment, {
    as: "product_managerment",
    foreignKey: "product_managerment_id",
  });
  work_list_pickingltl.hasMany(work_list, {
    as: "work_list",
    foreignKey: "workListPickingltlId",
  });
  work_list.belongsTo(work_list_pickingltl, {
    as: "work_list_pickingltl",
    foreignKey: "workListPickingltlId",
  });
  work_list.belongsTo(users, {
    as: "users",
    foreignKey: "worker_managerment_id",
  });
  users.hasMany(work_list, {
    as: "work_list",
    foreignKey: "worker_managerment_id",
  });
  location_managermenrt.hasMany(product_location, {
    as: "product_location",
    foreignKey: "location_managerment_id",
  });
  product_location.belongsTo(location_managermenrt, {
    as: "location_managermenrt",
    foreignKey: "location_managerment_id",
  });
  work_list_detail.hasMany(active, {
    as: "active",
    foreignKey: "work_list_detail_id",
  });
  active.belongsTo(work_list_detail, {
    as: "work_list_detail",
    foreignKey: "work_list_detail_id",
  });
  work_list_detail.hasOne(product_managerment, {
    as: "product_managerment",
    foreignKey: "workListDetailId",
  });
  product_managerment.belongsTo(work_list_detail, {
    as: "work_list_detail",
    foreignKey: "workListDetailId",
  });
  // worker_managerment.hasMany(work_list, {
  //   as: "work_list",
  //   foreignKey: "users",
  // });
  // work_list.belongsTo(worker_managerment, {
  //   as: "worker_managerment",
  //   foreignKey: "users",
  // });
  work_list.hasMany(inventory_scan, {
    as: "inventory_scan",
    foreignKey: "work_list_id",
  });
  inventory_scan.belongsTo(work_list, {
    as: "work_list",
    foreignKey: "work_list_id",
  });
  worker_managerment.hasMany(inventory_scan, {
    as: "inventory_scan",
    foreignKey: "userId",
  });
  inventory_scan.belongsTo(worker_managerment, {
    as: "worker_managerment",
    foreignKey: "userId",
  });
  work_list.hasMany(inventory_count, {
    as: "inventory_count",
    foreignKey: "workListId",
  });
  inventory_count.belongsTo(work_list, {
    as: "work_list",
    foreignKey: "workListId",
  });
  inventory_pallet.belongsTo(work_list_detail, {
    as: "work_list_detail",
    foreignKey: "work_list_detail_id",
  });
  work_list_detail.hasMany(inventory_pallet, {
    as: "inventory_pallet",
    foreignKey: "work_list_detail_id",
  });
  inventory_pallet.belongsTo(work_list, {
    as: "work_list",
    foreignKey: "work_list_id",
  });
  work_list.hasMany(inventory_pallet, {
    as: "inventory_pallet",
    foreignKey: "work_list_id",
  });
  inventory_scan.hasMany(inventory_pallet, {
    as: "inventory_pallet",
    foreignKey: "inventory_scan_id",
  });
  inventory_pallet.belongsTo(inventory_scan, {
    as: "inventory_scan",
    foreignKey: "inventory_scan_id",
  });
  users.hasMany(inventory_scan, {
    as: "inventory_scan",
    foreignKey: "admin_id",
  });
  inventory_scan.belongsTo(users, {
    as: "users",
    foreignKey: "admin_id",
  });
  active.hasMany(active_pallet, {
    as: "active_pallet",
    foreignKey: "active_id",
  });
  active_pallet.belongsTo(active, {
    as: "active",
    foreignKey: "active_id",
  });
  product_managerment.hasMany(product_managerment_image, {
    as: "product_managerment_image",
    foreignKey: "product_managerment_id",
  });
  product_managerment_image.belongsTo(product_managerment, {
    as: "product_managerment",
    foreignKey: "product_managerment_id",
  });
  return {
    users,
    worker_managerment,
    product_managerment,
    location_managermenrt,
    location_list_managerment,
    work_list,
    work_list_detail,
    product_transfer,
    active,
    product_location,
    work_list_pickingltl,
    inventory_count,
    inventory_scan,
    adjustment,
    inventory_pallet,
    active_pallet,
    product_managerment_image,
  };
}
