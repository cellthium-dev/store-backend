import { defineRouteConfig } from "@medusajs/admin-sdk";
import { TagSolid } from "@medusajs/icons";
import {
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Heading,
  useDataTable,
} from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { sdk } from "../../lib/sdk";

type Brand = { id: string; name: string };
type BrandsResponse = {
  brands: Brand[];
  count: number;
  limit: number;
  offset: number;
};

const columnHelper = createDataTableColumnHelper<Brand>();
const columns = [
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("name", { header: "Name" }),
];

export default function BrandsPage() {
  const limit = 15;
  const [pagination, setPagination] = React.useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const offset = React.useMemo(() => pagination.pageIndex * limit, [pagination]);

  const { data, isLoading } = useQuery<BrandsResponse>({
    queryKey: [["brands", limit, offset]],
    queryFn: () => sdk.client.fetch("/admin/brands", { query: { limit, offset } }),
  });

  const table = useDataTable({
    columns,
    data: data?.brands || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  });

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>Brands</Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
}

export const config = defineRouteConfig({
  label: "Brands",
  icon: TagSolid,
});
