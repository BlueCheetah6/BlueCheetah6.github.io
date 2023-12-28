import React, { useState, useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { useHistory } from 'react-router-dom';
import jwtDecode from 'jwt-decode'; // Corrected import statement

const RestrictedPage = () => {
  const { oktaAuth } = useOktaAuth();
  const history = useHistory();
  const [ahpraNumber, setAhpraNumber] = useState(null); // State to store ahpraNumber

  useEffect(() => {
    const validateUser = async () => {
      try {
        const accessToken = await oktaAuth.getAccessToken();
        const decodedToken = jwtDecode(accessToken);
        const ahpraNum = decodedToken['ahpra'];

        setAhpraNumber(ahpraNum); // Set the state

        if (!ahpraNum) {
          await oktaAuth.signOut();
          history.push('/error');
          return;
        }

        const response = await fetch(
          'https://uui498as1h.execute-api.ap-southeast-1.amazonaws.com/prod/v1/au/validation',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ahpra_number: ahpraNum,
              client_id: 'IGUE6DJRNIW664F3',
              redirect_uri: 'https://jnjiefprod.azurewebsites.net/',
              reference: '',
              _home_address: '',
              state: '1234',
            }),
          }
        );

        const data = await response.json();
        if (data.code !== 200 || data.message !== 'success') {
          await oktaAuth.signOut();
          history.push('/error');
        } else {
          history.push('/');
        }
      } catch (error) {
        console.error('Validation error:', error);
        await oktaAuth.signOut();
        history.push('/error');
      }
    };

    validateUser();
  }, [oktaAuth, history]);

  return (
    <div>
      {ahpraNumber
        ? 'Additional validation is in progress, please wait.'
        : 'AHPRANumber is missing for the User'}
    </div>
  );
};

export default RestrictedPage;
