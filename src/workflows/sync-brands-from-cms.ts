import { Brand } from ".medusa/types/query-entry-points";
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { BRAND_MODULE } from "src/modules/brand";
import BrandModuleService from "src/modules/brand/service";
import { CMS_MODULE } from "src/modules/cms";
import CmsModuleService from "src/modules/cms/service";

const retrieveBrandsFromCmsStep = createStep(
  "retrieve-brands-from-cms",
  async (_, { container }) => {
    const cmsModuleService: CmsModuleService = container.resolve(CMS_MODULE);

    const brands = await cmsModuleService.retrieveBrands();

    return new StepResponse(brands);
  }
);

type CreateBrand = {
  name: string;
};

type CreateBrandInput = {
  brands: CreateBrand[];
};

export const createBrandStep = createStep(
  "create-brand",
  async (input: CreateBrandInput, { container }) => {
    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);

    const brands = await brandModuleService.createBrands(input.brands);
    return new StepResponse(brands, brands);
  },
  async (brands, { container }) => {
    if (!brands) return;

    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);
    await brandModuleService.deleteBrands(brands.map((brand: Brand) => brand.id));
  }
);

type UpdateBrand = {
  id: string;
  name: string;
};

type UpdateBrandsInput = {
  brands: UpdateBrand[];
};

export const updateBrandStep = createStep(
  "update-brand",
  async ({ brands }: UpdateBrandsInput, { container }) => {
    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);

    const prevUpdatedBrands = await brandModuleService.listBrands({
      id: brands.map((brand) => brand.id),
    });

    const updatedBrands = await brandModuleService.updateBrands(brands);

    return new StepResponse(updatedBrands, prevUpdatedBrands);
  },
  async (prevUpdatedBrands, { container }) => {
    if (!prevUpdatedBrands) return;

    const brandModuleService: BrandModuleService = container.resolve(BRAND_MODULE);
    await brandModuleService.updateBrands(prevUpdatedBrands);
  }
);

export const syncBrandsFromCmsWorkflow = createWorkflow("sync-brands-from-cms", () => {
  const brands = retrieveBrandsFromCmsStep();

  const { toCreate, toUpdate } = transform({ brands }, (data) => {
    const toCreate: CreateBrand[] = [];
    const toUpdate: UpdateBrand[] = [];

    data.brands.forEach((brand) => {
      if (brand.external_id)
        toUpdate.push({ id: brand.external_id as string, name: brand.name as string });
      else toCreate.push({ name: brand.name as string });
    });

    return { toCreate, toUpdate };
  });

  const created = createBrandStep({ brands: toCreate });
  const updated = updateBrandStep({ brands: toUpdate });

  return new WorkflowResponse({ created, updated });
});
