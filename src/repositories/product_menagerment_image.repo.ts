import { product_managerment_image } from "../models/product_managerment_image.model";

export const create = (data: any) => {
  const created = new Date();
  const updated = new Date();

  const newPMI = new product_managerment_image({
    image: data.url,
    product_managerment_id: data.productManagermentId,
    created_at: created,
    updated_at: updated,
  });

  return newPMI.save();
};

export const deletePI = (productManagermentId: number) => {
  return product_managerment_image.destroy({
    where: { id: productManagermentId },
  });
};
