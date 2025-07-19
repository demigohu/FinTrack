import React, { createContext, useState, useEffect } from "react";
import { utilsNx } from "./utils.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { getBalance, getIncome, getExpense, getProfile, isAuthenticated, login, logout, isLoggedIn, getReportByMonth, getUsdToIdrConversionRate, getIncomeReport, getExpenseReport, updateActor, setWalletAddress, fetchBtcTransactions, getBtcBalance, getBtcRates } = utilsNx();
  const [mainBalances, setMainBalances] = useState(0);
  const [mainIncome, setMainIncome] = useState(0);
  const [mainExpense, setMainExpense] = useState(0);
  const [reportBalances, setReportBalances] = useState(0);
  const [reportIncome, setReportIncome] = useState(0);
  const [reportExpense, setReportExpense] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [activeReportFilter, setActiveReportFilter] = useState("all");
  const [walletAddress, setWalletAddressState] = useState("");
  const [btcBalance, setBtcBalance] = useState(0);
  const [btcTransactions, setBtcTransactions] = useState([]);
  const [btcToIdr, setBtcToIdr] = useState(null);
  const [btcToUsd, setBtcToUsd] = useState(null);
  const [usdToIdr, setUsdToIdr] = useState(null);

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  const [monthMain, setMonthMain] = useState(defaultMonth);
  const [monthReport, setMonthReport] = useState(defaultMonth);
  
  const [currency, setCurrency] = useState("idr");
  const [exchangeRate, setExchangeRate] = useState(null);

  const handleCurrency = async () => {
    const rate = await getUsdToIdrConversionRate();
    console.log('rate now: ', rate);
    setExchangeRate(rate.Ok);
    console.log('rate now 2: ', exchangeRate);
  }

  // Load rates dari localStorage
  const loadRatesFromStorage = () => {
    try {
      const stored = localStorage.getItem('fintrack_rates');
      if (stored) {
        const rates = JSON.parse(stored);
        const now = Date.now();
        // Cache berlaku 5 menit
        if (now - rates.timestamp < 5 * 60 * 1000) {
          setBtcToIdr(rates.btcToIdr);
          setBtcToUsd(rates.btcToUsd);
          setUsdToIdr(rates.usdToIdr);
          console.log('Rates loaded from cache:', rates);
          return true;
        }
      }
    } catch (e) {
      console.error('Error loading rates from storage:', e);
    }
    return false;
  };

  // Save rates ke localStorage
  const saveRatesToStorage = (btcToIdr, btcToUsd, usdToIdr) => {
    try {
      const rates = {
        btcToIdr,
        btcToUsd,
        usdToIdr,
        timestamp: Date.now()
      };
      localStorage.setItem('fintrack_rates', JSON.stringify(rates));
      console.log('Rates saved to cache:', rates);
    } catch (e) {
      console.error('Error saving rates to storage:', e);
    }
  };

  // Fetch kurs BTC/IDR, BTC/USD, dan USD/IDR dari backend
  const fetchAllRates = async () => {
    try {
      console.log('Fetching BTC rates...');
      const btcRes = await getBtcRates();
      console.log('BTC rates response:', btcRes);
      
      let btcToIdrRate = null;
      let btcToUsdRate = null;
      
      if (btcRes && btcRes.Ok && Array.isArray(btcRes.Ok) && btcRes.Ok.length === 2) {
        btcToIdrRate = btcRes.Ok[0];
        btcToUsdRate = btcRes.Ok[1];
        setBtcToIdr(btcToIdrRate);
        setBtcToUsd(btcToUsdRate);
        console.log('BTC rates set:', btcToIdrRate, btcToUsdRate);
      } else {
        console.log('Invalid BTC rates response:', btcRes);
      }
      
      console.log('Fetching USD/IDR rate...');
      const usdRes = await getUsdToIdrConversionRate();
      console.log('USD/IDR rate response:', usdRes);
      
      let usdToIdrRate = null;
      
      if (usdRes && usdRes.Ok) {
        usdToIdrRate = usdRes.Ok;
        setUsdToIdr(usdToIdrRate);
        console.log('USD/IDR rate set:', usdToIdrRate);
      } else {
        console.log('Invalid USD/IDR rate response:', usdRes);
      }

      // Save ke localStorage jika semua rates berhasil
      if (btcToIdrRate && btcToUsdRate && usdToIdrRate) {
        saveRatesToStorage(btcToIdrRate, btcToUsdRate, usdToIdrRate);
      }
    } catch (e) {
      console.error('Error fetching rates:', e);
      setBtcToIdr(null);
      setBtcToUsd(null);
      setUsdToIdr(null);
    }
  };

  useEffect(() => {
    updateActor();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      // Coba load dari cache dulu
      const cacheLoaded = loadRatesFromStorage();
      
      if (!cacheLoaded) {
        // Jika cache tidak ada atau expired, fetch dari API
        fetchAllRates();
      }
      
      // Update tiap 5 menit
      const interval = setInterval(fetchAllRates, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    console.log('isloggedin: ', isLoggedIn);
    if (isLoggedIn) {
      console.log("User is logged in, fetching balances...");
      console.log("Current monthMain:", monthMain);
      console.log("Current monthReport:", monthReport);
      handleCurrency();
      handleGetMainBalances(monthMain);
      handleGetMainIncome(monthMain);
      handleGetMainExpense(monthMain);
      handleGetReportByMonth(monthReport);
      handleGetReportBalances("");
      handleGetReportIncome("");
      handleGetReportExpense("");
    }
  }, [isLoggedIn]);

  // Refresh balances when rates change
  useEffect(() => {
    if (isLoggedIn && (btcToIdr !== null || usdToIdr !== null)) {
      console.log("Rates updated, refreshing balances...");
      handleGetMainBalances(monthMain);
      handleGetMainIncome(monthMain);
      handleGetMainExpense(monthMain);
      handleGetReportBalances("");
      handleGetReportIncome("");
      handleGetReportExpense("");
    }
  }, [btcToIdr, btcToUsd, usdToIdr, isLoggedIn]);

  // Refresh balances when currency changes
  useEffect(() => {
    if (isLoggedIn) {
      console.log("Currency changed to:", currency, "refreshing balances...");
      console.log("Current rates:", { btcToIdr, btcToUsd, usdToIdr });
      handleGetMainBalances(monthMain);
      handleGetMainIncome(monthMain);
      handleGetMainExpense(monthMain);
      handleGetReportBalances("");
      handleGetReportIncome("");
      handleGetReportExpense("");
    }
  }, [currency, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      if (activeReportFilter == 'all') {
        handleGetReportByMonth(monthReport);
      } else if (activeReportFilter == 'income'){
        handleGetReportIncomeByMonth(monthReport)
      } else {
        handleGetReportExpenseByMonth(monthReport);
      }
    };
  }, [activeReportFilter]);

  const convertCurrency = (amount, transactionCurrency = null) => {
    // Handle null/undefined amount
    if (amount === null || amount === undefined) return "0";
    
    console.log('convertCurrency called with:', { 
      amount, 
      transactionCurrency, 
      currency, 
      btcToIdr, 
      btcToUsd, 
      usdToIdr
    });
    
    // Display sesuai currency transaksi atau global
    const displayCurrency = transactionCurrency || currency;
    
    if (displayCurrency === "btc") {
      return `₿ ${Number(amount).toFixed(8)}`;
    } else if (displayCurrency === "usd") {
      return `$ ${Number(amount).toFixed(2)}`;
    } else if (displayCurrency === "idr") {
      return `Rp. ${Number(amount).toLocaleString("id-ID")}`;
    }
    
    return amount;
  };

  // Fungsi untuk konversi amount menggunakan rates dari backend
  const convertAmountWithRates = (amount, fromCurrency, toCurrency) => {
    if (!amount || !fromCurrency || !toCurrency) return amount;
    
    console.log('convertAmountWithRates:', { amount, fromCurrency, toCurrency, btcToIdr, btcToUsd, usdToIdr });
    
    // Jika currency sama, return as is
    if (fromCurrency.toLowerCase() === toCurrency.toLowerCase()) {
      return amount;
    }
    
    // Konversi menggunakan rates dari backend
    const fromLower = fromCurrency.toLowerCase();
    const toLower = toCurrency.toLowerCase();
    
    try {
      if (fromLower === "btc" && toLower === "idr" && btcToIdr) {
        return amount * btcToIdr;
      } else if (fromLower === "btc" && toLower === "usd" && btcToUsd) {
        return amount * btcToUsd;
      } else if (fromLower === "usd" && toLower === "idr" && usdToIdr) {
        return amount * usdToIdr;
      } else if (fromLower === "idr" && toLower === "usd" && usdToIdr) {
        return amount / usdToIdr;
      } else if (fromLower === "idr" && toLower === "btc" && btcToIdr) {
        return amount / btcToIdr;
      } else if (fromLower === "usd" && toLower === "btc" && btcToUsd) {
        return amount / btcToUsd;
      }
    } catch (error) {
      console.error('Error converting amount:', error);
    }
    
    // Fallback: return original amount
    return amount;
  };

  const handleLogin = async () => {
    await login();
    // handleGetBalances();
  };

  const handleLogout = async () => {
    await logout();
    // setIsLoggedIn(false);
    setMainBalances(0);
    setMainIncome(0);
    setMainExpense(0);
    setTransactions([]);
  };

  const handleGetMainBalances = async (month) => {
    try {
      // Ambil balance untuk semua currency
      const [idrBalance, usdBalance, btcBalance] = await Promise.all([
        getBalance(month, "IDR"),
        getBalance(month, "USD"), 
        getBalance(month, "BTC")
      ]);
      
      console.log('All balances:', { idrBalance, usdBalance, btcBalance });
      
      // Konversi semua ke currency yang dipilih untuk display
      const idrAmount = idrBalance.Ok || 0;
      const usdAmount = usdBalance.Ok || 0;
      const btcAmount = btcBalance.Ok || 0;
      
      // Konversi USD dan BTC ke currency display
      const usdConverted = convertAmountWithRates(usdAmount, "USD", currency.toUpperCase());
      const btcConverted = convertAmountWithRates(btcAmount, "BTC", currency.toUpperCase());
      
      const totalBalance = idrAmount + usdConverted + btcConverted;
      console.log('Total balance converted:', totalBalance);
      
      setMainBalances(totalBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setMainBalances(0);
    }
  };

  const handleGetMainIncome = async (month) => {
    try {
      // Ambil income untuk semua currency
      const [idrIncome, usdIncome, btcIncome] = await Promise.all([
        getIncome(month, "IDR"),
        getIncome(month, "USD"), 
        getIncome(month, "BTC")
      ]);
      
      console.log('All income:', { idrIncome, usdIncome, btcIncome });
      
      // Konversi semua ke currency yang dipilih untuk display
      const idrAmount = idrIncome.Ok || 0;
      const usdAmount = usdIncome.Ok || 0;
      const btcAmount = btcIncome.Ok || 0;
      
      // Konversi USD dan BTC ke currency display
      const usdConverted = convertAmountWithRates(usdAmount, "USD", currency.toUpperCase());
      const btcConverted = convertAmountWithRates(btcAmount, "BTC", currency.toUpperCase());
      
      const totalIncome = idrAmount + usdConverted + btcConverted;
      console.log('Total income converted:', totalIncome);
      
      setMainIncome(totalIncome);
    } catch (error) {
      console.error('Error fetching income:', error);
      setMainIncome(0);
    }
  };

  const handleGetMainExpense = async (month) => {
    try {
      // Ambil expense untuk semua currency
      const [idrExpense, usdExpense, btcExpense] = await Promise.all([
        getExpense(month, "IDR"),
        getExpense(month, "USD"), 
        getExpense(month, "BTC")
      ]);
      
      console.log('All expense:', { idrExpense, usdExpense, btcExpense });
      
      // Konversi semua ke currency yang dipilih untuk display
      const idrAmount = idrExpense.Ok || 0;
      const usdAmount = usdExpense.Ok || 0;
      const btcAmount = btcExpense.Ok || 0;
      
      // Konversi USD dan BTC ke currency display
      const usdConverted = convertAmountWithRates(usdAmount, "USD", currency.toUpperCase());
      const btcConverted = convertAmountWithRates(btcAmount, "BTC", currency.toUpperCase());
      
      const totalExpense = idrAmount + usdConverted + btcConverted;
      console.log('Total expense converted:', totalExpense);
      
      setMainExpense(totalExpense);
    } catch (error) {
      console.error('Error fetching expense:', error);
      setMainExpense(0);
    }
  };

  const handleGetReportBalances = async (month) => {
    try {
      // Ambil balance untuk semua currency
      const [idrBalance, usdBalance, btcBalance] = await Promise.all([
        getBalance(month, "IDR"),
        getBalance(month, "USD"), 
        getBalance(month, "BTC")
      ]);
      
      console.log('Report balances:', { idrBalance, usdBalance, btcBalance });
      
      // Konversi semua ke currency yang dipilih untuk display
      const idrAmount = idrBalance.Ok || 0;
      const usdAmount = usdBalance.Ok || 0;
      const btcAmount = btcBalance.Ok || 0;
      
      // Konversi USD dan BTC ke currency display
      const usdConverted = convertAmountWithRates(usdAmount, "USD", currency.toUpperCase());
      const btcConverted = convertAmountWithRates(btcAmount, "BTC", currency.toUpperCase());
      
      const totalBalance = idrAmount + usdConverted + btcConverted;
      console.log('Report total balance converted:', totalBalance);
      
      setReportBalances(totalBalance);
    } catch (error) {
      console.error('Error fetching report balance:', error);
      setReportBalances(0);
    }
  };

  const handleGetReportIncome = async (month) => {
    try {
      // Ambil income untuk semua currency
      const [idrIncome, usdIncome, btcIncome] = await Promise.all([
        getIncome(month, "IDR"),
        getIncome(month, "USD"), 
        getIncome(month, "BTC")
      ]);
      
      console.log('Report income:', { idrIncome, usdIncome, btcIncome });
      
      // Konversi semua ke currency yang dipilih untuk display
      const idrAmount = idrIncome.Ok || 0;
      const usdAmount = usdIncome.Ok || 0;
      const btcAmount = btcIncome.Ok || 0;
      
      // Konversi USD dan BTC ke currency display
      const usdConverted = convertAmountWithRates(usdAmount, "USD", currency.toUpperCase());
      const btcConverted = convertAmountWithRates(btcAmount, "BTC", currency.toUpperCase());
      
      const totalIncome = idrAmount + usdConverted + btcConverted;
      console.log('Report total income converted:', totalIncome);
      
      setReportIncome(totalIncome);
    } catch (error) {
      console.error('Error fetching report income:', error);
      setReportIncome(0);
    }
  };

  const handleGetReportExpense = async (month) => {
    try {
      // Ambil expense untuk semua currency
      const [idrExpense, usdExpense, btcExpense] = await Promise.all([
        getExpense(month, "IDR"),
        getExpense(month, "USD"), 
        getExpense(month, "BTC")
      ]);
      
      console.log('Report expense:', { idrExpense, usdExpense, btcExpense });
      
      // Konversi semua ke currency yang dipilih untuk display
      const idrAmount = idrExpense.Ok || 0;
      const usdAmount = usdExpense.Ok || 0;
      const btcAmount = btcExpense.Ok || 0;
      
      // Konversi USD dan BTC ke currency display
      const usdConverted = convertAmountWithRates(usdAmount, "USD", currency.toUpperCase());
      const btcConverted = convertAmountWithRates(btcAmount, "BTC", currency.toUpperCase());
      
      const totalExpense = idrAmount + usdConverted + btcConverted;
      console.log('Report total expense converted:', totalExpense);
      
      setReportExpense(totalExpense);
    } catch (error) {
      console.error('Error fetching report expense:', error);
      setReportExpense(0);
    }
  };

  const handleGetReportByMonth = async (month) => {
    try {
      const report = await getReportByMonth(month);
      console.log('report: ', report);
      setTransactions(report.Ok || []);
    } catch (error) {
      console.error('Error getting report by month:', error);
    }
  };

  const handleGetReportIncomeByMonth = async (month) => {
    try {
      const report = await getIncomeReport(month);
      console.log('report income by month: ', report);
      setTransactions(report.Ok || []);
    } catch (error) {
      console.error('Error getting report by month:', error);
    }
  }

  const handleGetReportExpenseByMonth = async (month) => {
    try {
      const report = await getExpenseReport(month);
      console.log('report expense by month: ', report);
      setTransactions(report.Ok || []);
    } catch (error) {
      console.error('Error getting report by month:', error);
    }
  }

  // Handler untuk set wallet address BTC
  const handleSetWalletAddress = async (address) => {
    await setWalletAddress("BTC", address);
    setWalletAddressState(address);
  };

  // Handler untuk fetch saldo BTC
  const handleFetchBtcBalance = async () => {
    const res = await getBtcBalance();
    if (res && res.Ok !== undefined) setBtcBalance(Number(res.Ok) / 100_000_000); // konversi ke BTC
  };

  // Handler untuk fetch transaksi BTC (otomasi pemasukan)
  const handleFetchBtcTransactions = async () => {
    const res = await fetchBtcTransactions();
    if (res && res.Ok && res.Ok.utxos) setBtcTransactions(res.Ok.utxos);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      handleLogin, 
      handleLogout, 
      mainBalances, 
      mainIncome, 
      mainExpense, 
      transactions, 
      reportBalances, 
      reportIncome, 
      reportExpense, 
      setMainBalances, 
      setMainIncome, 
      setMainExpense, 
      setTransactions, 
      setReportBalances, 
      setReportExpense, 
      setReportIncome, 
      monthMain, 
      setMonthMain, 
      monthReport, 
      setMonthReport, 
      currency, 
      setCurrency, 
      convertCurrency, 
      convertAmountWithRates, 
      exchangeRate, 
      activeReportFilter, 
      setActiveReportFilter, 
      walletAddress, 
      setWalletAddress: handleSetWalletAddress, 
      btcBalance, 
      fetchBtcBalance: handleFetchBtcBalance, 
      btcTransactions, 
      fetchBtcTransactions: handleFetchBtcTransactions, 
      btcToIdr, 
      btcToUsd, 
      usdToIdr,
      handleGetMainBalances,
      handleGetMainIncome,
      handleGetMainExpense,
      handleGetReportBalances,
      handleGetReportIncome,
      handleGetReportExpense,
      handleGetReportByMonth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
