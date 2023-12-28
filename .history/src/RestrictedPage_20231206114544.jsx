import React, { useEffect } from "react";
import { useOktaAuth } from "@okta/okta-react";
import { useHistory } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const RestrictedPage = () => {
  const { oktaAuth } = useOktaAuth();
  const history = useHistory();

  useEffect(() => {
    const validateUser = async () => {
      try {
        // Retrieve access token
        const accessToken = oktaAuth.getAccessToken();
        const decodedToken = jwtDecode(accessToken); // Decode the token
        const ahpraNumber = decodedToken["ahpra"]; // Replace with the actual key
        if (!ahpraNumber) {
            await oktaAuth.signOut();
            throw new Error("AHPRANumber is missing from the token");
          }
          else {
        const response = await fetch(
          "https://uui498as1h.execute-api.ap-southeast-1.amazonaws.com/prod/v1/au/validation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ahpra_number: ahpraNumber,
              client_id: "IGUE6DJRNIW664F3",
              redirect_uri: "https://jnjiefprod.azurewebsites.net/",
              reference: "",
              _home_address: "",
              state: "1234",
            }),
          }
        );

        console.log("response>>" + JSON.stringify(response));
        const data = await response.json();

        // Handle response and redirect
        if (data.code === 200 && data.message === "success") {
          history.push("/"); // Redirect to Home on success
        } else {
          await oktaAuth.signOut();
          history.push("/error"); // Redirect to an error page or handle differently
        }
      } 
    }
    catch (error) {
        await oktaAuth.signOut();
        console.error("Validation error:", error);
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
  {ahpraNumber ? "Additional validation is in progress, please wait." : "AHPRANumber is missing for the User"}
</div>
  );
};

export default RestrictedPage;
