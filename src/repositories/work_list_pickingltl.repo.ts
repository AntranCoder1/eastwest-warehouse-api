import { work_list_pickingltl } from "../models/work_list_pickingltl.model";
import { work_list } from "../models/work_list.model";

export const create = (data) => {
  const created = new Date();
  const updated = new Date();

  const newWorkList = new work_list_pickingltl({
    created_at: created,
    updated_at: updated,
    name: data.name,
    Status: "working",
  });

  return newWorkList.save();
};

export const findPickingLtl = () => {
  return work_list_pickingltl.findAll();
};

export const getDetailPickingLtl = (id: any) => {
  return work_list_pickingltl.findAll({
    where: {
      id: id,
    },
    include: [
      {
        association: work_list_pickingltl.associations.work_list,
        include: [
          {
            association: work_list.associations.work_list_detail,
          },
        ],
      },
    ],
  });
};

export const updateStatus = (workListId: number, number: number) => {
  let status = "";
  if (number === 1) {
    status = "complete";
  }
  if (number === 2) {
    status = "working";
  }
  return work_list_pickingltl.update(
    { Status: status },
    { where: { id: workListId } }
  );
};
