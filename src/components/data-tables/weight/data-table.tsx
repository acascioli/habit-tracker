
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

import { toast } from "@/hooks/use-toast"
import {
  ColumnDef, SortingState, ColumnFiltersState, VisibilityState,
  flexRender,
  getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EditForm } from "@/components/forms/EditForm"
import useWeightStore from "@/store/weight"
import useDBStore from "@/store/db"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
}

interface Identifiable {
  id: number;
}

export function DataTable<TData extends Identifiable, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })


  const removeWeights = useWeightStore((state) => state.removeWeights)
  const db = useDBStore((state) => state.db)

  async function onDelete(rowsToDelete: Array<TData>) {
    if (db) {
      try {
        console.log(rowsToDelete)
        // Start a transaction if supported
        await Promise.all(
          rowsToDelete.map(async (row) => {
            await db.execute(
              `
            DELETE FROM weights
            WHERE id = ?
            `,
              [row.id]
            );
          })
        );

        toast({
          title: "Data Deleted",
          description: `${rowsToDelete.length} item(s) have been successfully removed from the database.`,
        });

        // Update the parent's state to remove the deleted items
        const idsToDelete = rowsToDelete.map((row) => row.id);
        removeWeights(idsToDelete); // Ensure `removeWeights` is implemented in the parent component

      } catch (error) {
        toast({
          title: "Error",
          description: "There was an issue deleting your data.",
          variant: "destructive",
        });
        console.error("Error deleting data from the database:", error);
      }
    }
  }
  return (
    <div>
      {/* <div className="flex items-center py-4"> */}
      {/*   <Input */}
      {/*     placeholder="Filter emails..." */}
      {/*     value={(table.getColumn("email")?.getFilterValue() as string) ?? ""} */}
      {/*     onChange={(event) => */}
      {/*       table.getColumn("email")?.setFilterValue(event.target.value) */}
      {/*     } */}
      {/*     className="max-w-sm" */}
      {/*   /> */}
      {/*   <DropdownMenu> */}
      {/*     <DropdownMenuTrigger asChild> */}
      {/*       <Button variant="outline" className="ml-auto"> */}
      {/*         Columns */}
      {/*       </Button> */}
      {/*     </DropdownMenuTrigger> */}
      {/*     <DropdownMenuContent align="end"> */}
      {/*       {table */}
      {/*         .getAllColumns() */}
      {/*         .filter( */}
      {/*           (column) => column.getCanHide() */}
      {/*         ) */}
      {/*         .map((column) => { */}
      {/*           return ( */}
      {/*             <DropdownMenuCheckboxItem */}
      {/*               key={column.id} */}
      {/*               className="capitalize" */}
      {/*               checked={column.getIsVisible()} */}
      {/*               onCheckedChange={(value) => */}
      {/*                 column.toggleVisibility(!!value) */}
      {/*               } */}
      {/*             > */}
      {/*               {column.id} */}
      {/*             </DropdownMenuCheckboxItem> */}
      {/*           ) */}
      {/*         })} */}
      {/*     </DropdownMenuContent> */}
      {/*   </DropdownMenu> */}
      {/* </div> */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <div className="flex items-center justify-end space-x-2 pb-2">
        <EditForm data={table.getFilteredSelectedRowModel().rows} db={db} />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(table.getFilteredSelectedRowModel().rows.map((row) => row.original))}
          disabled={table.getFilteredSelectedRowModel().rows.length == 0}
        >
          Delete
        </Button>
      </div>
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
    </div>
  )
}
