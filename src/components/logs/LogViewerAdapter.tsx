// src/components/logs/LogViewerAdapter.tsx
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { LogEntry, LogType, LogQueryOptions } from '../../database/models/logModels';
import { 
  fetchLogs, 
  markErrorFixed, 
  exportLogs, 
  setQueryOptions 
} from '../../store/slices/logsSlice';
import { RootState } from '../../store';

/**
 * Props for LogViewerAdapter component
 */
export interface LogViewerAdapterProps {
  /** Default log types to display */
  defaultLogType?: LogType | LogType[];
  /** Default limit of logs to fetch per page */
  defaultLimit?: number;
  /** Whether to show filtering controls */
  showFilters?: boolean;
  /** Whether to allow exporting logs */
  allowExport?: boolean;
  /** Height of the DataTable */
  height?: string;
}

export const LogViewerAdapter: React.FC<LogViewerAdapterProps> = ({
  defaultLogType = ['error', 'edit'],
  defaultLimit = 50,
  showFilters = true,
  allowExport = true,
  height = '600px',
}) => {
  const dispatch = useDispatch();
  const { 
    logs, 
    totalLogs, 
    status, 
    error, 
    queryOptions 
  } = useSelector((state: RootState) => state.logs);

  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const dt = useRef<any>(null);
  const toast = useRef<any>(null);
  
  const loading = status === 'loading';

  // Initialize query options on component mount
  useEffect(() => {
    dispatch(setQueryOptions({
      type: defaultLogType,
      limit: defaultLimit,
      offset: 0,
      sort: 'desc'
    }));
  }, [dispatch, defaultLogType, defaultLimit]);

  // Fetch logs when query options change
  useEffect(() => {
    dispatch(fetchLogs(queryOptions));
  }, [dispatch, queryOptions]);

  // Show error toast if fetch fails
  useEffect(() => {
    if (status === 'failed' && error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to fetch logs: ${error}`,
        life: 3000
      });
    }
  }, [status, error]);

  // Handle search input
  const handleSearch = (value: string) => {
    dispatch(setQueryOptions({
      ...queryOptions,
      search: value || undefined,
      offset: 0 // Reset pagination when searching
    }));
  };

  // Handle filter changes
  const handleFilterChange = (changes: Partial<LogQueryOptions>) => {
    dispatch(setQueryOptions({
      ...queryOptions,
      ...changes,
      offset: 0 // Reset pagination when changing filters
    }));
  };

  // Handle export
  const handleExport = (format: 'json' | 'markdown') => {
    dispatch(exportLogs({ format, options: queryOptions }));
  };

  const onPage = (event: any) => {
    dispatch(setQueryOptions({
      ...queryOptions,
      limit: event.rows,
      offset: event.first,
    }));
  };

  const onSort = (event: any) => {
    dispatch(setQueryOptions({
      ...queryOptions,
      sort: event.sortOrder === 1 ? 'asc' : 'desc',
    }));
  };

  const onFilter = (event: any) => {
    dispatch(setQueryOptions({
      ...queryOptions,
      search: event.filters.global?.value || undefined,
    }));
  };

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const logTypeOptions = [
    { label: 'Error', value: 'error' },
    { label: 'Edit', value: 'edit' },
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Debug', value: 'debug' },
  ];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const timeBodyTemplate = (rowData: LogEntry) => {
    return formatDate(rowData.timestamp);
  };

  const typeBodyTemplate = (rowData: LogEntry) => {
    const severity = rowData.type === 'error' 
      ? 'danger' 
      : rowData.type === 'warning' 
        ? 'warning' 
        : rowData.type === 'info' 
          ? 'info' 
          : rowData.type === 'debug' 
            ? 'secondary' 
            : 'primary';
    
    return <Tag value={rowData.type} severity={severity} />;
  };

  const actionBodyTemplate = (rowData: LogEntry) => {
    return (
      <Button 
        icon="pi pi-search" 
        className="p-button-rounded p-button-text" 
        onClick={() => {
          setSelectedLog(rowData);
          setDetailsVisible(true);
        }} 
      />
    );
  };

  const getLogDetails = () => {
    if (!selectedLog) return null;
    
    let details = null;
    try {
      if (selectedLog.details) {
        details = JSON.parse(selectedLog.details);
      }
    } catch (err) {
      details = selectedLog.details;
    }
    
    return (
      <div className="p-4">
        <h3 className="text-xl mb-4">{selectedLog.message}</h3>
        
        <div className="grid">
          <div className="col-4">
            <h4 className="font-semibold">Time</h4>
            <p>{formatDate(selectedLog.timestamp)}</p>
          </div>
          <div className="col-4">
            <h4 className="font-semibold">Type</h4>
            <p>{typeBodyTemplate(selectedLog)}</p>
          </div>
          <div className="col-4">
            <h4 className="font-semibold">Component</h4>
            <p>{selectedLog.component}</p>
          </div>
        </div>
        
        {selectedLog.stackTrace && (
          <div className="mt-4">
            <h4 className="font-semibold">Stack Trace</h4>
            <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">{selectedLog.stackTrace}</pre>
          </div>
        )}
        
        {details && (
          <div className="mt-4">
            <h4 className="font-semibold">Details</h4>
            <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
              {typeof details === 'object' ? JSON.stringify(details, null, 2) : details}
            </pre>
          </div>
        )}
        
        {selectedLog.relatedFiles && selectedLog.relatedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold">Related Files</h4>
            <ul className="list-disc pl-6">
              {selectedLog.relatedFiles.map((file, i) => (
                <li key={i}>{file}</li>
              ))}
            </ul>
          </div>
        )}
        
        {selectedLog.type === 'error' && (
          <div className="mt-4">
            <h4 className="font-semibold">Status</h4>
            <p>{selectedLog.fixed ? 'Fixed' : 'Not Fixed'}</p>
            
            {!selectedLog.fixed && (
              <Button 
                label="Mark as Fixed" 
                className="mt-2" 
                onClick={() => {
                  try {
                    dispatch(markErrorFixed(selectedLog.id!));
                    toast.current.show({ 
                      severity: 'success', 
                      summary: 'Success', 
                      detail: 'Error marked as fixed' 
                    });
                    setDetailsVisible(false);
                  } catch (err) {
                    toast.current.show({ 
                      severity: 'error', 
                      summary: 'Error', 
                      detail: 'Failed to mark error as fixed' 
                    });
                  }
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card primereact-scope">
      <Toast ref={toast} />
      
      {showFilters && (
        <div className="flex flex-wrap gap-2 justify-content-between align-items-center mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText 
                placeholder="Search logs..." 
                onInput={(e) => handleSearch((e.target as HTMLInputElement).value)}
              />
            </span>
            
            <MultiSelect
              value={Array.isArray(queryOptions.type) ? queryOptions.type : [queryOptions.type].filter(Boolean)}
              options={logTypeOptions}
              onChange={(e) => handleFilterChange({ type: e.value })}
              placeholder="Filter by type"
              className="w-full md:w-15rem"
            />
          </div>
          
          {allowExport && (
            <div className="flex gap-2">
              <Button 
                label="Export CSV" 
                icon="pi pi-file" 
                onClick={exportCSV} 
              />
              <Button 
                label="Export JSON" 
                icon="pi pi-file" 
                onClick={() => handleExport('json')} 
              />
              <Button 
                label="Export Markdown" 
                icon="pi pi-file" 
                onClick={() => handleExport('markdown')} 
              />
            </div>
          )}
        </div>
      )}
      
      <DataTable
        ref={dt}
        value={logs}
        paginator
        rows={queryOptions.limit}
        totalRecords={totalLogs}
        lazy
        first={queryOptions.offset || 0}
        onPage={onPage}
        onSort={onSort}
        sortField="timestamp"
        sortOrder={queryOptions.sort === 'asc' ? 1 : -1}
        loading={loading}
        emptyMessage="No logs found"
        tableStyle={{ minWidth: '50rem' }}
        filters={{ global: { value: queryOptions.search || '', matchMode: 'contains' } }}
        onFilter={onFilter}
        globalFilterFields={['message', 'component']}
        style={{ height }}
        scrollable
        scrollHeight="flex"
      >
        <Column field="timestamp" header="Time" body={timeBodyTemplate} sortable />
        <Column field="type" header="Type" body={typeBodyTemplate} sortable />
        <Column field="component" header="Component" sortable />
        <Column field="message" header="Message" />
        <Column body={actionBodyTemplate} headerStyle={{ width: '4rem' }} />
      </DataTable>
      
      <Dialog
        header="Log Details"
        visible={detailsVisible}
        style={{ width: '80vw', maxWidth: '1200px' }}
        onHide={() => setDetailsVisible(false)}
        maximizable
      >
        {getLogDetails()}
      </Dialog>
    </div>
  );
};