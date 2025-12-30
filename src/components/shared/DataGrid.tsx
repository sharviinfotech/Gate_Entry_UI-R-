import { ReactNode, useState } from 'react';
import { Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Column {
  key: string;
  header: string;
  width?: string;
  render?: (value: any, row: any, index: number) => ReactNode;
}

interface DataGridProps<T> {
  columns: Column[];
  data: T[];
  onRowDelete?: (index: number) => void;
  onAddRow?: () => void;
  editable?: boolean;
  minRows?: number;
  emptyMessage?: string;
  itemsPerPage?: number;
  showActions?: boolean;
  maxHeight?: string;
}

export function DataGrid<T extends Record<string, any>>({
  columns,
  data,
  onRowDelete,
  onAddRow,
  editable = false,
  minRows = 1,
  emptyMessage = 'No items added',
  itemsPerPage = 5,
  showActions = true,
  maxHeight = '400px',
}: DataGridProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const canDelete = data.length > minRows;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Reset to valid page if current page becomes invalid after deletion
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return (
    <div className="space-y-3">
      <div className="data-grid">
        <div className="overflow-auto scrollbar-thin" style={{ maxHeight }}>
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-12 text-center">#</th>
                {columns.map((col) => (
                  <th key={col.key} style={{ width: col.width }}>
                    {col.header}
                  </th>
                ))}
                {editable && showActions && <th className="w-20 text-center">Action</th>}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (editable && showActions ? 2 : 1)} className="text-center py-8 text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, pageIndex) => {
                  const actualIndex = startIndex + pageIndex;
                  return (
                    <tr key={actualIndex} className="group">
                      <td className="text-center font-medium text-muted-foreground">{actualIndex + 1}</td>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.render ? col.render(row[col.key], row, actualIndex) : row[col.key] || '-'}
                        </td>
                      ))}
                      {editable && showActions && (
                        <td className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onRowDelete?.(actualIndex)}
                            disabled={!canDelete}
                            title="Delete row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length} items
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {editable && onAddRow && (
        <Button variant="outline" size="sm" onClick={onAddRow} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Row
        </Button>
      )}
    </div>
  );
}
