import { InferTypeOf } from "@medusajs/framework/types";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { Brand } from "src/modules/brand/models/brand";
import { CMS_MODULE } from "src/modules/cms";
import CmsModuleService from "src/modules/cms/service";

type SyncBrandToCmsStepInput = {
  brand: InferTypeOf<typeof Brand>;
};

const syncBrandToCmsStep = createStep(
  "sync-brand-to-cms",
  async ({ brand }: SyncBrandToCmsStepInput, { container }) => {
    const cmsModuleService: CmsModuleService = container.resolve(CMS_MODULE);
    await cmsModuleService.createBrand(brand);

    return new StepResponse(null, brand.id);
  },
  async (id, { container }) => {
    if (!id) return;

    const cmsModuleService: CmsModuleService = container.resolve(CMS_MODULE);
    await cmsModuleService.deleteBrand(id);
  }
);

type SyncBrandToCmsWorkflowInput = {
  id: string;
};

export const syncBrandToCmsWorkflow = createWorkflow(
  "sync-brand-to-cms",
  (input: SyncBrandToCmsWorkflowInput) => {
    // @ts-ignore
    const { data: brands } = useQueryGraphStep({
      entity: "brand",
      fields: ["*"],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      },
    });

    syncBrandToCmsStep({ brand: brands[0] } as SyncBrandToCmsStepInput);

    return new WorkflowResponse({});
  }
);
