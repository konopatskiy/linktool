import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable, usePagination } from 'react-table';
import './App.css'; // Import the CSS file

const App = () => {
  const [products, setProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching products');
    }
  };

  const importCsv = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchProducts();
    } catch (error) {
      console.error('Error importing CSV:', error);
      setError('Error importing CSV');
    }
  };

  const truncate = (str, maxLength) => {
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };

  const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateMyData, // This is a custom function that we supplied to our table instance
  }) => {
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);

    const onChange = e => {
      setValue(e.target.value);
    };

    const onDoubleClick = () => {
      setIsEditing(true);
    };

    const onKeyDown = e => {
      if (e.key === 'Enter') {
        setIsEditing(false);
        updateMyData(index, id, value);
      }
    };

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return isEditing ? (
      <input
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={() => setIsEditing(false)}
        autoFocus
      />
    ) : (
      <div onDoubleClick={onDoubleClick}>
        {truncate(value, 150)}
      </div>
    );
  };

  const columns = React.useMemo(
    () => products.length > 0 ? Object.keys(products[0]).map(key => ({
      Header: key,
      accessor: key,
      Cell: EditableCell,
    })) : [],
    [products]
  );

  const data = React.useMemo(() => products, [products]);

  const updateMyData = (rowIndex, columnId, value) => {
    setProducts(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 50 }, // Set initial page size to 50
      updateMyData,
    },
    usePagination
  );

  return (
    <div>
      <h1>Product Catalog</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={importCsv}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Import CSV</button>
      </form>
      <button onClick={fetchProducts}>Show All Contents</button>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default App;
