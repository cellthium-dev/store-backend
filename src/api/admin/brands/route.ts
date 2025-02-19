import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { createBrandWorkflow } from "src/workflows/create-brand";
import z from "zod";
import { PostAdminCreateBrand } from "./validators";

type PostAdminCreateBrandType = z.infer<typeof PostAdminCreateBrand>;

export const POST = async (req: MedusaRequest<PostAdminCreateBrandType>, res: MedusaResponse) => {
  const { result } = await createBrandWorkflow(req.scope).run({ input: req.validatedBody });

  res.json({ brand: result });
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: brands, metadata } = await query.graph({
    entity: "brand",
    ...req.queryConfig,
  });

  if (metadata === undefined) return res.json({ brands });

  const { count, take, skip } = metadata;
  res.json({ brands, count, limit: take, offset: skip });
};
