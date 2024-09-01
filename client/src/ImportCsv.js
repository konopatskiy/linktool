import React, { useState, useRef } from 'react';
import axios from 'axios';
import LoadingBar from 'react-top-loading-bar';

const ImportCsv = ({ fetchProducts }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const importCsv = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    ref.current.continuousStart();
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
    } finally {
      ref.current.complete();
      setLoading(false);
    }
  };

  return (
    <div>
      <LoadingBar color="#1abc9c" ref={ref} height={15} />
      <h1>Import CSV</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={importCsv}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Import CSV</button>
      </form>
    </div>
  );
};

export default ImportCsv;