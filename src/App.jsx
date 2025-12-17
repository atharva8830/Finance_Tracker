import * as XLSX from 'xlsx';
import './App.css'
import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // Add 1 and pad with zero if needed
const day = String(today.getDate()).padStart(2, '0'); // Pad with zero if needed





function App() {

  const [exp, setexp] = useState("");
  const [obj, setobj] = useState({});
  const [amt, setamt] = useState("");
  const [total, settotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [flag, setflag] = useState(false);
  const [date, setdate] = useState("");



  const todayISO = new Date().toISOString().split("T")[0];

 

  function flagfun() {
    if (Object.keys(obj).length > 0) {
      setflag(prev => !prev);
    }
  }



  useEffect(() => {
    console.log(obj);
  }, [obj])



  let credit = () => {
      const formattedDate = date || todayISO;
       if (exp.trim() === "" || Number(amt) <= 0) {
    alert("Please enter a valid positive amount");
    return;
  }

    // if (exp.trim() !== "" && Number(amt) > 0) {

    //   settotal((prevTotal) => prevTotal + Number(amt));


    //   setobj((prev) => ({
    //     ...prev,
    //     [exp]: {
    //       amount: Number(amt),
    //       transaction: "credit",
    //       date: formattedDate,
    //     },
    //   }));
    // }
    
     if (exp.trim() !== "" && Number(amt) > 0) {

    const finalDate = date || todayISO;

    settotal(prev => prev + Number(amt));

    setobj(prev => ({
      ...prev,
      [Date.now()]: {
        title: exp,
        amount: Number(amt),
        transaction: "credit",
        date: finalDate,
      },
    }));

    if(amt <0){
      setnegative(true);
    }

    setexp("");
    setamt("");
    setdate("");

  }
}




let debit = () => {
    const formattedDate = date || todayISO;
      if (exp.trim() === "" || Number(amt) <= 0) {
    alert("Please enter a valid positive amount");
    return;
  }

  // if (exp.trim() !== "" && Number(amt) > 0) {
  //   settotal((prevTotal) => prevTotal - Number(amt));


  //   setobj((prev) => ({
  //     ...prev,
  //     [exp]: {
  //       amount: Number(amt),
  //       transaction: "debit",
  //       date: formattedDate,
  //     },
  //   }));
  // }

   if (exp.trim() !== "" && Number(amt) > 0) {

    const finalDate = date || todayISO;

    settotal(prev => prev - Number(amt));

    setobj(prev => ({
      ...prev,
      [Date.now()]: {
        title: exp,
        amount: Number(amt),
        transaction: "debit",
        date: formattedDate ,
      },
    }));

    if(amt < 0){
      setnegative(true);
    }

  setexp("");
  setamt("");
  setdate("");
}
}


const getTotalCredit = () => {
  return Object.entries(obj).reduce((sum, [_, details]) => {
    if (details.transaction === "credit") {
      return sum + Number(details.amount || 0);
    }
    return sum;
  }, 0);
};


const getTotalDebit = () => {
  return Object.entries(obj).reduce((sum, [_, details]) => {
    if (details.transaction === "debit") {
      return sum + Number(details.amount || 0);
    }
    return sum;
  }, 0);
};

  

const exportToExcel = () => {
  const totalCredit = getTotalCredit();
  const totalDebit = getTotalDebit();
  // Convert your object to an array format for Excel
  const data = Object.entries(obj).map(([title, details]) => ({
    Title: title,
    Amount: details.amount,
    Type: details.transaction,
    Date : details.date ,
  }));

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

  // Add total balance as summary
  const summaryData = [
    // { Title: "Total Balance", Amount: total, Type: "" }

    { Metric: "Total Balance", Value: total },
    { Metric: "Total Credit", Value: totalCredit },
    { Metric: "Total Debit", Value: totalDebit },

  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Download the file
  XLSX.writeFile(workbook, "transactions.xlsx");
};


const filteredData = Object.entries(obj).filter(([name, data]) => {

  const matchesSearch =
    // either the search box is empy of the data contains what the user just typed 
    search.trim() === "" ||
    data.title.toLowerCase().includes(search.toLowerCase());

  // 🔁 Credit / Debit condition
  const matchesType =
    //     “Either the user selected ‘All’
    // OR
    // this transaction’s type matches the selected filter”
    typeFilter === "all" || data.transaction === typeFilter;

  return matchesSearch && matchesType;
});

const chartData = [
  { name: "Credit", value: getTotalCredit() },
  { name: "Debit", value: getTotalDebit() },
];

const barData = Object.entries(obj).map(([name, data]) => ({
  name: data.title,
  amount: data.amount,
  transaction: data.transaction,
}));

return (
  <>



    <div className='container'>

      <h3><u>Total balance : {total}</u></h3>


      <div className='inputs'>

        <div>
          <label htmlFor="">Enter the title </label>
          <input type='text' value={exp} onChange={(e) => setexp(e.target.value)} /> <br />
        </div>

        <div>
          <label htmlFor=""> Enter the amount </label>
          <input type='number' value={amt} onChange={(e) => setamt(e.target.value)} />
        </div>

        <div>
          <label htmlFor=""> Enter the date </label>
          <input type='date' value={date} onChange={(e) => setdate(e.target.value)} placeholder='empty for current date ' />
        </div>


      </div>

      <div className='buttons'>
        <button onClick={credit}> credit </button>
        <button onClick={debit}> Debit </button>
      </div>



      <label>
        Search Box
      </label>

      <input type="text" placeholder='enter the title' value={search}
        onChange={(e) => setSearch(e.target.value)} />

      <div className="filters">
        <button onClick={() => setTypeFilter("all")}>All</button>
        <button onClick={() => setTypeFilter("credit")}>Credit</button>
        <button onClick={() => setTypeFilter("debit")}>Debit</button>
      </div>



      <div className='list'>
        {search.trim() !== "" && filteredData.length === 0 && (
          <p>No matching transactions</p>
        )}
        <ul>

          <div className="li-header">

            <li>Title</li>
            <li>Amount</li>
            <li>Date</li>         
          </div>

          {filteredData.map(([name, data]) => (
            <li key={name} className={data.transaction === "credit" ? "item credit" : "item debit"}>
              <div>
                {data.title}
              </div>
              <div>
                {data.amount}
              </div>
              <div>
                {data.date}
              </div> 
            </li>
            
          ))}
        </ul>
      
      </div>

      <div className='bottom'>
        <button
          className='dow'
          onClick={exportToExcel}
          disabled={Object.keys(obj).length === 0}>
          Download Excel
        </button>

        <button onClick={flagfun}
          disabled={Object.keys(obj).length === 0}
        >
          Visualize
        </button>
      </div>

    </div>

    {/* <hr /> */}

    {flag &&
      (<div className="charts">
        <div className='pie-'>
          <h3>Credit vs Debit</h3>

          <PieChart width={300} height={300} >
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              animationBegin={0}
              animationDuration={800}
              label
            >
              <Cell fill="#4CAF50" /> {/* Credit */}
              <Cell fill="#F44336" /> {/* Debit */}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="bar">


          <BarChart width={300} height={300} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar dataKey="amount" animationDuration={700}>
              {barData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.transaction === "credit" ? "#4CAF50" : "#F44336"}
                />
              ))}
            </Bar>
          </BarChart>
        </div>

      </div>)}

  </>
)
}
export default App
 