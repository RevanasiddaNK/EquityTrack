# Equity Track : Stock Portfolio Application

**Equity Track** Stock App Portfolio Equity Track is a web application designed to help users track and manage their investment portfolios, focusing on real-time equity tracking. The app provides an intuitive interface for users to add stocks, view portfolio performance, and stay updated with stock prices.

## Project Overview

**Equity Track** allows users to maintain a personalized portfolio by adding stocks, tracking their value, and receiving live updates on stock prices. The app calculates and displays the user's portfolio performance and provides insights into their investments.

## Key Features

- 🎤 **User  Authentication** :  Secure login system with JWT-based authentication for personalized portfolio access.
- 💼 **Portfolio Management** :  Users can add/remove stocks, specify the quantity owned, and record purchase prices.
- 🕹️ **Real-Time Stock Price Updates** :  Fetch and display real-time stock prices using an API.
- 🧮 **Portfolio Value Calculation** : Automatically calculate the total value of the portfolio, including gains and losses.
- 📈 **Performance Tracking** : View performance over time, including total profit/loss and percentage changes.
- 📅 **Transaction History**: (Coming Soon) Keep track of stock purchases, sales, and portfolio adjustments, displaying a timeline of transactions and their impact on the portfolio.

## Technologies Used

- **Frontend**:  
  - **React.js**:  For building dynamic user interfaces.
  - **Tailwind CSS**: Utility-first CSS framework for styling.
    
- **Backend**:  
  - **Node.js**:  JavaScript runtime for backend development.
  - **Express.js**: Web framework for building APIs.
  - **JWT (JSON Web Token)**:For secure authentication and session management.

- **Database**:  
  - **MongoDB**:  NoSQL database for storing portfolio and user data.
  -  **Mongoose**:  ODM (Object Data Modeling) library to interact with MongoDB.
    
- **Stock Price API**:  
  - **Alpha Vantage API**: Provides real-time stock price updates.

### Getting Started


1. clone the repository:
   ```bash
    https://github.com/RevanasiddaNK/EquityTrack.git
   ```
   
2. Navigate to the project directory:
   ```bash
    cd EquityTrack
   ```
   
3. Set up environment variables :
   ```bash
   NODE_ENV = production
   PORT = 5000
   SECRET_KEY = "xxxxx"
   ALPHA_VANTAGE_API_KEY = xxxyyyyzzzz
   MONGO_URI = mongodb+srv://<username>:<password>@cluster0.x5e13.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
  
4.  Install dependencies:
   ```bash
       npm run build
   ```

5. Start the development server:
   ```bash
     npm run start
