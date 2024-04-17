import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';

const CryptoConverter = () => {
  const [cryptoData, setCryptoData] = useState(null);
  const [cryptoList, setCryptoList] = useState([]);
  const [selectedFiat, setSelectedFiat] = useState({ value: 'USD', label: 'US Dollar (USD)' });

  const [cryptoSymbol, setCryptoSymbol] = useState('BTC');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [amount, setAmount] = useState(1);
  const [conversionDirection, setConversionDirection] = useState('cryptoToFiat');

  const START_INDEX = 15;
  const END_INDEX = 29;

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get(
          `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${cryptoSymbol}&tsyms=${fiatCurrency}`
        );
        setCryptoData(response.data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };

    fetchCryptoData();
  }, [cryptoSymbol, fiatCurrency]);

  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        const response = await axios.get('https://min-api.cryptocompare.com/data/all/coinlist');
        const coins = response.data.Data;
        const cryptoSymbols = Object.keys(coins).slice(START_INDEX, END_INDEX);
        setCryptoList(cryptoSymbols);
      } catch (error) {
        console.error('Error fetching crypto list:', error);
      }
    };

    fetchCryptoList();
  }, []);

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const getPrice = () => {
    if (cryptoData && cryptoData.DISPLAY && cryptoData.DISPLAY[cryptoSymbol] && cryptoData.DISPLAY[cryptoSymbol][fiatCurrency]) {
      const priceWithSymbol = cryptoData.DISPLAY[cryptoSymbol][fiatCurrency].PRICE;
      let priceWithoutSymbol = priceWithSymbol.replace(/[,]/g, '');
      const symbols = ['$', '€', 'AED', 'CAD', 'AUD','¥', '£'];
      for (const symbol of symbols) {
        if (priceWithSymbol.includes(symbol)) {
          priceWithoutSymbol = priceWithoutSymbol.replace(symbol, '');
          break;
        }
      }
      return parseFloat(priceWithoutSymbol);
    }
    return NaN;
  };

  const calculateConvertedAmount = () => {
    const price = getPrice();
    if (conversionDirection === 'cryptoToFiat') {
      return parseFloat(price) * parseFloat(amount);
    } else {
      return parseFloat(amount) / parseFloat(price);
    }
  };

  const options = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'AED', label: 'United Arab Emirates Dirham (AED)' },
    { value: 'CNY', label: 'Chinese YAN (CNY)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
  
  ];

  const handleFiatChange = (selectedOption) => {
    setSelectedFiat(selectedOption);
    setFiatCurrency(selectedOption.value);
  };

  const handleCryptoChange = (selectedOption) => {
    setCryptoSymbol(selectedOption.value); 
  };

  const toggleConversionDirection = () => {
    setConversionDirection(conversionDirection === 'cryptoToFiat' ? 'fiatToCrypto' : 'cryptoToFiat');
  };

  return (
    <div className='container'>
      <h1>Cryptocurrency Converter</h1>
      <div style={{marginTop:"10%"}}>
      <div>
        <input type="number" id="amount" value={amount} onChange={handleAmountChange} style={{ width: '30%', height: "30px", marginLeft: '30%', marginBottom: '20px', borderRadius: '8px' }} />
      </div>
      <div className='crypto'>
        <Select className='select'
          options={cryptoList.map(symbol => ({ value: symbol, label: symbol }))}
          value={{ value: cryptoSymbol, label: cryptoSymbol }}
          onChange={handleCryptoChange}
          placeholder="Select Cryptocurrency..."
          isSearchable
          styles={{
            control: (provided) => ({
              ...provided,
              width: '30%',
              marginLeft: '30%',
              marginBottom: '20px'
            }),
            menu: (provided) => ({
              ...provided,
              width: '30%',
              marginLeft: '30%',
            }),
          }}
        />
      </div>

      <div className='fiat'>
        <Select
          options={options}
          value={selectedFiat}
          onChange={handleFiatChange}
          placeholder="Select Fiat Currency..."
          isSearchable
          styles={{
            control: (provided) => ({
              ...provided,
              width: '30%',
              marginLeft: '30%'
            }),
            menu: (provided) => ({
              ...provided,
              width: '30%',
              marginLeft: '30%',
            }),
          }}
        />
      </div>

      <button className='btn btn-primary' type="submit" onClick={toggleConversionDirection} style={{ marginTop: '10px', marginLeft:'42%' }}>
       Switch
      </button>

      {!isNaN(calculateConvertedAmount()) && (
  <div style={{ marginLeft: '35%' }}>
    <h2>Conversion Result</h2>
    <p style={{fontSize:"20px"}}>{amount} {conversionDirection === 'cryptoToFiat' ? cryptoSymbol : selectedFiat.value} = ${calculateConvertedAmount().toLocaleString('en', { minimumFractionDigits: 8 })} {conversionDirection === 'cryptoToFiat' ? selectedFiat.value : cryptoSymbol}</p>
  </div>
)}
</div>
    </div>
  );
};

export default CryptoConverter;
