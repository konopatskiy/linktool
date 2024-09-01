import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useTable, usePagination, useSortBy } from 'react-table';
import LoadingBar from 'react-top-loading-bar';
import BottomNav from './BottomNav';
import Home from './Home';
import ImportCsv from './ImportCsv';
import './App.css'; // Import the CSS file

const App = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // State for loading
  const ref = useRef(null); // Ref for the loading bar

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    ref.current.continuousStart();
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching products');
    } finally {
      ref.current.complete();
      setLoading(false);
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

  const updateMyData = async (rowIndex, columnId, value) => {
    // Update the local state
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

    // Send the updated data to the server
    try {
      const updatedRow = products[rowIndex];
      const response = await axios.post('/api/update', {
        id: updatedRow.id, // Assuming 'id' is the primary key
        [columnId]: value
      });

      if (response.status === 200) {
        console.log('Data saved successfully');
      } else {
        console.error('Error saving data:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
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
      initialState: { pageIndex: 0, pageSize: 30 }, // Set initial page size to 30
      updateMyData,
    },
    useSortBy, // Add useSortBy hook
    usePagination
  );

  return (
    <Router>
      <div>
        <LoadingBar color="#1abc9c" ref={ref} height={15} /> {/* Set height to 15px */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={
            <div>
              <h1>Product Catalog</h1>
              {error && <p style={{ color: 'red' }}>{error}</p>}
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
                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                          {column.render('Header')}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? ' 🔽'
                                : ' 🔼'
                              : ''}
                          </span>
                        </th>
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
          } />
          <Route path="/import" element={<ImportCsv fetchProducts={fetchProducts} />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
};

export default App;