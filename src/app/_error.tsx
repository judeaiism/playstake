import { NextPage, NextPageContext } from 'next';
import React from 'react';

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  const errorMessage = statusCode
    ? `An error ${statusCode} occurred on server`
    : 'An error occurred on client';

  return React.createElement('p', null, errorMessage) as React.ReactElement;
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  console.error('Error occurred:', err);
  return { statusCode };
};

export default Error;
