import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types";
import { clx, Container, Heading, Text } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../lib/sdk";

type AdminProductBrand = AdminProduct & {
  brand?: {
    id: string;
    name: string;
  };
};

const ProductBrandWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const { data: result } = useQuery({
    queryKey: [["product", product.id]],
    queryFn: () => sdk.admin.product.retrieve(product.id, { fields: "+brand.*" }),
  });

  const brandName = (result?.product as AdminProductBrand)?.brand?.name;

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Brand</Heading>
        </div>
      </div>
      <div className={clx(`text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`)}>
        <Text size="small" weight="plus" leading="compact">
          Name
        </Text>

        <Text size="small" leading="compact" className="whitespace-pre-line text-pretty">
          {brandName || "-"}
        </Text>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.before",
});

export default ProductBrandWidget;
