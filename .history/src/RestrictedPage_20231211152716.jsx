import React, { useState, useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { useHistory } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const RestrictedPage = () => {
  const { oktaAuth } = useOktaAuth();
  const history = useHistory();
  const [expirationdate, setexpirationdate] = useState(null);

  useEffect(() => {
    const validateUser = async () => {
      try {
        // Retrieve access token
        const accessToken = oktaAuth.getAccessToken();
        const decodedToken = jwtDecode(accessToken); // Decode the token
        const ahpraNum = decodedToken["expirationdate"]; // Replace with the actual key
        setexpirationdate(ahpraNum); // Set the state
        if (!ahpraNum) {
            await oktaAuth.signOut();
            return;
          }
          else {
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
                  ahpra: ahpraNum,
                }
              }),
            });
    

        console.log("response>>" + JSON.stringify(response));
        const data = await response.json();

        // Handle response and redirect
        if (data.code !== 200 || data.message !== "success") {
          await oktaAuth.signOut();
          history.push("/error");
        } else {
          history.push("/");
        }
      } 
    }
    catch (error) {
        console.error("Validation error:", error);
         await oktaAuth.signOut();
        if (history) {
          // revoke token
          // invalidate session
          //redirect to login page
          await oktaAuth.signOut();
          history.push("/error"); // Redirect to an error page
        } else {
          console.error("History object is undefined");
        }
      }
    };

    validateUser();
  }, [oktaAuth, history]);

  return (
    <div>
      {expirationdate
        ? "Additional validation is in progress, please wait."
        : "expirationdate is missing for the User"}
    </div>
  );
};

export default RestrictedPage;
