import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {ApolloClient,ApolloProvider,InMemoryCache,ApolloLink,HttpLink,concat} from "@apollo/client";


const httpLink = new HttpLink({ uri: 'https://concrete-pegasus-40.hasura.app/v1/graphql' });

const admin_secret ="7hboYOlxO4N9MYlR3LaJQj4G2kIyNUXWzqUoiLdG4LFoL9Ma5NkuUnXQW63XCgG0";

const activityMiddleware = new ApolloLink((operation, forward) => {
  // add the recent-activity custom header to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      "content-type": "application/json",
      "x-hasura-admin-secret": admin_secret
    }
  }));
  return forward(operation);
})

const client = new ApolloClient({
  link: concat(activityMiddleware, httpLink),
  cache: new InMemoryCache()
})
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
  ,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

