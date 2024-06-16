import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [view, setView] = useState('sentiment');
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numNews, setNumNews] = useState(3);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [userPrompt, setUserPrompt] = useState('');

  const popularCompanies = [
    { value: 'GOOGL', label: 'Alphabet (Google)' },
    { value: 'NVDA', label: 'Nvidia' },
    { value: 'AMZN', label: 'Amazon' },
    { value: 'META', label: 'Meta (Facebook)' },
    { value: 'MSFT', label: 'Microsoft' },
    { value: 'AAPL', label: 'Apple' },
    { value: 'TSLA', label: 'Tesla' },
    { value: 'NFLX', label: 'Netflix' },
    { value: 'BABA', label: 'Alibaba' },
    { value: 'ORCL', label: 'Oracle' },
    { value: 'IBM', label: 'IBM' },
    { value: 'INTC', label: 'Intel' },
    { value: 'CSCO', label: 'Cisco' },
    { value: 'ADBE', label: 'Adobe' },
    { value: 'CRM', label: 'Salesforce' },
    { value: 'PYPL', label: 'PayPal' },
    { value: 'GOOG', label: 'Google' },
    { value: 'OPENAI', label: 'OpenAI' },
    { value: 'DIS', label: 'Disney' },
    { value: 'V', label: 'Visa' },
    { value: 'MA', label: 'Mastercard' },
    { value: 'JPM', label: 'JPMorgan Chase' },
    { value: 'GS', label: 'Goldman Sachs' },
    { value: 'BAC', label: 'Bank of America' },
    { value: 'WMT', label: 'Walmart' },
    { value: 'HD', label: 'Home Depot' },
    { value: 'PG', label: 'Procter & Gamble' },
    { value: 'KO', label: 'Coca-Cola' },
    { value: 'PEP', label: 'PepsiCo' },
    { value: 'MCD', label: 'McDonald\'s' },
    { value: 'NKE', label: 'Nike' },
    { value: 'XOM', label: 'ExxonMobil' },
    { value: 'CVX', label: 'Chevron' },
    { value: 'PFE', label: 'Pfizer' },
    { value: 'MRK', label: 'Merck' },
    { value: 'JNJ', label: 'Johnson & Johnson' },
    { value: 'UNH', label: 'UnitedHealth Group' },
    { value: 'ABBV', label: 'AbbVie' },
    { value: 'ABT', label: 'Abbott Laboratories' },
    { value: 'T', label: 'AT&T' },
    { value: 'VZ', label: 'Verizon' },
    { value: 'TMUS', label: 'T-Mobile' },
    { value: 'CMCSA', label: 'Comcast' },
    { value: 'NFLX', label: 'Netflix' },
    { value: 'NVAX', label: 'Novavax' },
    { value: 'BMY', label: 'Bristol-Myers Squibb' },
    { value: 'LLY', label: 'Eli Lilly' },
    { value: 'MRNA', label: 'Moderna' },
    { value: 'GILD', label: 'Gilead Sciences' },
    { value: 'CLX', label: 'Clorox' },
    { value: 'COST', label: 'Costco' },
    { value: 'TGT', label: 'Target' },
    { value: 'LOW', label: 'Lowe\'s' },
    { value: 'BBY', label: 'Best Buy' },
    { value: 'SBUX', label: 'Starbucks' },
    { value: 'ROST', label: 'Ross Stores' },
    { value: 'WBA', label: 'Walgreens' },
    { value: 'CVS', label: 'CVS Health' },
    { value: 'ANTM', label: 'Anthem' },
    { value: 'C', label: 'Citigroup' },
    { value: 'MS', label: 'Morgan Stanley' },
    { value: 'SCHW', label: 'Charles Schwab' },
    { value: 'AIG', label: 'American International Group' },
    { value: 'BRK.B', label: 'Berkshire Hathaway' },
    { value: 'BLK', label: 'BlackRock' },
    { value: 'SPGI', label: 'S&P Global' },
    { value: 'MCO', label: 'Moody\'s' },
    { value: 'ICE', label: 'Intercontinental Exchange' },
    { value: 'NDAQ', label: 'Nasdaq' },
    { value: 'CME', label: 'CME Group' },
    { value: 'GS', label: 'Goldman Sachs' },
    { value: 'AXP', label: 'American Express' },
    { value: 'DFS', label: 'Discover Financial' },
    { value: 'SYF', label: 'Synchrony Financial' },
    { value: 'COF', label: 'Capital One' },
    { value: 'BK', label: 'Bank of New York Mellon' },
    { value: 'STT', label: 'State Street' },
    { value: 'NTRS', label: 'Northern Trust' },
    { value: 'AMP', label: 'Ameriprise Financial' },
    { value: 'PRU', label: 'Prudential Financial' },
    { value: 'MET', label: 'MetLife' },
    { value: 'LNC', label: 'Lincoln National' },
    { value: 'UNM', label: 'Unum Group' },
    { value: 'ALL', label: 'Allstate' },
    { value: 'PGR', label: 'Progressive' },
    { value: 'TRV', label: 'Travelers' },
    { value: 'HIG', label: 'Hartford Financial' },
    { value: 'AFL', label: 'Aflac' },
    { value: 'CB', label: 'Chubb' },
    { value: 'WFC', label: 'Wells Fargo' },
    { value: 'USB', label: 'U.S. Bancorp' },
    { value: 'PNC', label: 'PNC Financial' },
    { value: 'TD', label: 'Toronto-Dominion Bank' },
    { value: 'RY', label: 'Royal Bank of Canada' },
  ];

  useEffect(() => {
    setCompanies(popularCompanies);
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const requestData = {
        companies: selectedCompanies.map(company => company.value),
        start_date: startDate,
        end_date: endDate,
        num_news: numNews,
        system_prompt: systemPrompt
      };
      console.log('Sending request data:', requestData);  // Debugging line
      const response = await axios.post('http://localhost:5000/analyze', requestData);
      console.log('Analysis results:', response.data);  // Debugging line
      setResults(response.data);
    } catch (err) {
      setError('Error fetching analysis. Please try again.');
      console.error('Error fetching analysis:', err);
    }
    setLoading(false);
  };

const handleGenerate = async () => {
  setLoading(true);
  setError('');
  try {
    const requestData = {
      system_prompt: systemPrompt,
      prompt: userPrompt,
    };
    console.log('Sending generation request data:', requestData);
    const response = await axios.post('http://localhost:5000/generate', requestData);
    console.log('Generation results:', response.data);

    // Update messages state with new user and bot messages
    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: userPrompt },
      { role: 'bot', content: response.data.Prompt }  // Assuming 'Prompt' is the key where the bot's message is stored
    ]);

    // Clear the user prompt
    setUserPrompt('');  // Corrected from setUserDeveloped to setUserPrompt
  } catch (err) {
    setError('Error generating forecast. Please try again.');
    console.error('Error generating forecast:', err);
  }
  setLoading(false);
};

  const getCompanyName = (ticker) => {
    const company = companies.find(c => c.value === ticker);
    return company ? company.label : ticker;
  };

  const getCombinedChartData = () => {
    const labels = results.news_data ? results.news_data.map((result, index) => `${getCompanyName(result.company)} - News ${index + 1}`) : [];
    const sentimentScores = { bearish: [], neutral: [], bullish: [] };

    results.news_data && results.news_data.forEach(result => {
      if (result.sentiment === 'bearish') {
        sentimentScores.bearish.push(result.score);
        sentimentScores.neutral.push(0);
        sentimentScores.bullish.push(0);
      } else if (result.sentiment === 'neutral') {
        sentimentScores.bearish.push(0);
        sentimentScores.neutral.push(result.score);
        sentimentScores.bullish.push(0);
      } else if (result.sentiment === 'bullish') {
        sentimentScores.bearish.push(0);
        sentimentScores.neutral.push(0);
        sentimentScores.bullish.push(result.score);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Bearish',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255, 99, 132, 0.4)',
          hoverBorderColor: 'rgba(255, 99, 132, 1)',
          data: sentimentScores.bearish,
        },
        {
          label: 'Neutral',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(255, 206, 86, 0.4)',
          hoverBorderColor: 'rgba(255, 206, 86, 1)',
          data: sentimentScores.neutral,
        },
        {
          label: 'Bullish',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          hoverBackgroundColor: 'rgba(75, 192, 192, 0.4)',
          hoverBorderColor: 'rgba(75, 192, 192, 1)',
          data: sentimentScores.bullish,
        },
      ],
    };
  };

  const getDetailedChartData = (sentiment) => {
    const labels = results.news_data ? results.news_data
      .filter(result => result.sentiment === sentiment)
      .map((result, index) => `${getCompanyName(result.company)} - News ${index + 1}`) : [];
    const data = results.news_data ? results.news_data.filter(result => result.sentiment === sentiment).map(result => result.score) : [];

    return {
      labels,
      datasets: [
        {
          label: `${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment Scores`,
          backgroundColor: sentiment === 'bullish' ? 'rgba(75, 192, 192, 0.2)' : sentiment === 'neutral' ? 'rgba(255, 206, 86, 0.2)' : 'rgba(255, 99, 132, 0.2)',
          borderColor: sentiment === 'bullish' ? 'rgba(75, 192, 192, 1)' : sentiment === 'neutral' ? 'rgba(255, 206, 86, 1)' : 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          hoverBackgroundColor: sentiment === 'bullish' ? 'rgba(75, 192, 192, 0.4)' : sentiment === 'neutral' ? 'rgba(255, 206, 86, 0.4)' : 'rgba(255, 99, 132, 0.4)',
          hoverBorderColor: sentiment === 'bullish' ? 'rgba(75, 192, 192, 1)' : sentiment === 'neutral' ? 'rgba(255, 206, 86, 1)' : 'rgba(255, 99, 132, 1)',
          data,
        },
      ],
    };
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setView('sentiment')} style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: view === 'sentiment' ? '#007bff' : '#f0f0f0', color: view === 'sentiment' ? '#fff' : '#000', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Sentiment Analysis
        </button>
        <button onClick={() => setView('forecast')} style={{ padding: '10px 20px', backgroundColor: view === 'forecast' ? '#007bff' : '#f0f0f0', color: view === 'forecast' ? '#fff' : '#000', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Chatbot for Finance
        </button>
      </div>

      {view === 'sentiment' && (
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, marginRight: '20px' }}>
            <h1 style={{ color: '#333', marginBottom: '20px' }}>News Sentiment Analyzer</h1>
            <div style={{ marginBottom: '20px' }}>
              <Select
                isMulti
                options={companies}
                value={selectedCompanies}
                onChange={setSelectedCompanies}
                placeholder="Select companies..."
                style={{ marginBottom: '10px' }}
              />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '10px', marginRight: '10px' }}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '10px', marginRight: '10px' }}
              />
              <input
                type="number"
                value={numNews}
                onChange={(e) => setNumNews(e.target.value)}
                placeholder="Number of news articles per day per company"
                style={{ padding: '10px', width: '250px', marginRight: '10px' }}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
            <div style={{ marginTop: '20px' }}>
              {results.news_data && results.news_data.map((result, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                  <h2 style={{ margin: '10px 0' }}>News {index + 1}</h2>
                  <p><strong>Company:</strong> {getCompanyName(result.company)}</p>
                  <p><strong>Title:</strong> {result.title}</p>
                  <p><strong>Date:</strong> {result.date}</p>
                  <p><strong>Description:</strong> {result.description}</p>
                  <p><strong>Sentiment:</strong> {result.sentiment}</p>
                  <p><strong>Confidence:</strong> {result.score.toFixed(4)}</p>
                  <p><strong>Article Relevance for Company:</strong> {result.relevance_score.toFixed(4)}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {results.news_data && results.news_data.length > 0 && (
              <div>
                <h2 style={{ marginBottom: '20px' }}>Combined Sentiment Scores by Company</h2>
                <div style={{ width: '100%', height: '400px', margin: '0 auto' }}>
                  <Bar data={getCombinedChartData()} options={{ maintainAspectRatio: false }} />
                </div>
                <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>Detailed Sentiment Scores</h2>
                <div style={{ width: '100%', height: '400px', margin: '0 auto' }}>
                  <h3>Bullish Sentiment Scores</h3>
                  <Bar data={getDetailedChartData('bullish')} options={{ maintainAspectRatio: false }} />
                  <h3 style={{ marginTop: '40px' }}>Neutral Sentiment Scores</h3>
                  <Bar data={getDetailedChartData('neutral')} options={{ maintainAspectRatio: false }} />
                  <h3 style={{ marginTop: '40px' }}>Bearish Sentiment Scores</h3>
                  <Bar data={getDetailedChartData('bearish')} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            )}
            {results.forecast && (
              <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <h2>Forecast</h2>
                <p>{results.forecast}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ color: '#333', marginBottom: '20px' }}>Chatbot for Finance</h1>
          <div style={{ width: '100%', maxWidth: '800px', marginBottom: '20px' }}>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              style={{ padding: '10px', width: '100%', marginTop: '10px', height: '100px' }}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
            {messages.map((message, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '10px', borderRadius: '5px', backgroundColor: message.role === 'user' ? '#e1f5fe' : '#f1f8e9' }}>
                  <p><strong>{message.role === 'user' ? 'User' : 'Bot'}:</strong> {message.content}</p>
                </div>
          ))}
          {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
