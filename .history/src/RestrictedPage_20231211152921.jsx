import React, { useState, useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { useHistory } from "react-router-dom";
import jwtDecode from "jwt-decode"; // Ensure jwtDecode is imported correctly

const RestrictedPage = () => {
  const { oktaAuth } = useOktaAuth();
  const history = useHistory();
  const [expirationDate, setExpirationDate] = useState(null); // Use state for expirationDate

  useEffect(() => {
    const validateUser = async () => {
      try {
        const accessToken = await oktaAuth.getAccessToken();
        const decodedToken = jwtDecode(accessToken);
        const expDate = decodedToken["expirationDate"]; // Replace "exp" with the actual key in the token for the expiration date
        setExpirationDate(expDate); // Set the expiration date in the state

        if (!expDate) {
          await oktaAuth.signOut();
          return;
        }

        const response = await fetch('https://risk-jnjpoc.workflows.oktapreview.com/api/flo/28e2a38197e176511f1b50be74057dcd/invoke', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-client-token': '7a34b1a328e9925dab9738b7f7472f51fc9533bdc15c3e5f708aca294b7d1c85',
          },
          body: JSON.stringify({
            data: {
              id: "00uarpnrdtw0X5zzh1d7",
              expirationDate: expDate, // Use the expiration date from the token
            }
          }),
        });

        const data = await response.json();

        if (data.code !== 200 || data.message !== "success") {
          await oktaAuth.signOut();
          history.push("/error");
        } else {
          history.push("/");
        }
      } catch (error) {
        console.error("Validation error:", error);
        await oktaAuth.signOut();
        history.push("/error"); // Redirect to an error page
      }
    };

    validateUser();
  }, [oktaAuth, history]);

  return (
    <div>
      {expirationDate
        ? "Additional validation is in progress, please wait."
        : "Expiration date is missing for the User"}
    </div>
  );
};

export default RestrictedPage;
