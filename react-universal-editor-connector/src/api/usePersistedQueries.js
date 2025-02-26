import aemHeadlessClient from "./aemHeadlessClient";
import { useEffect, useState } from "react";

async function fetchPersistedQuery(persistedQueryName, queryParameters) {
  let data;
  let err;

  try {
    // AEM GraphQL queries are asynchronous, either await their return or use Promise-based syntax
    const response = await aemHeadlessClient.runPersistedQuery(
      persistedQueryName,
      queryParameters
    );
    // The GraphQL data is stored on the response's data field
    data = response?.data;
  } catch (e) {
    // An error occurred, return the error messages
    err = e
      .toJSON()
      ?.map((error) => error.message)
      ?.join(", ");
    console.error(e.toJSON());
  }

  // Return the GraphQL and any errors
  return { data, err };
}

export function useAllTeams() {
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState(null);

  // Use React useEffect to manage state changes
  useEffect(() => {
    async function fetchData() {
      // Call the AEM GraphQL persisted query named "my-project/all-teams"
      const { data, err } = await fetchPersistedQuery("my-project/all-teams");
      // Sets the teams variable to the list of team JSON objects
      setTeams(data?.teamList?.items);
      // Set any errors
      setError(err);
    }
    // Call the internal fetchData() as per React best practices
    fetchData();
  }, []);

  // Returns the teams and errors
  return { teams, error };
}

export function usePersonByName(fullName) {
  const [person, setPerson] = useState(null);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // The key is the variable name as defined in the persisted query, and may not match the model's field name
      const queryParameters = { name: fullName };

      // Invoke the persisted query, and pass in the queryParameters object as the 2nd parameter
      const { data, err } = await fetchPersistedQuery(
        "my-project/person-by-name",
        queryParameters
      );

      if (err) {
        // Capture errors from the HTTP request
        setErrors(err);
      } else if (data?.personList?.items?.length === 1) {
        // Set the person data after data validation
        setPerson(data.personList.items[0]);
      } else {
        // Set an error if no person could be found
        setErrors(`Cannot find person with name: ${fullName}`);
      }
    }
    fetchData();
  }, [fullName]);

  return { person, errors };
}
