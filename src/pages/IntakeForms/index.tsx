import { Button } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { CaseType, QuestionType } from "../../../types";
import FormHolder from "../../components/FormHolder/FormHolder";
import styles from "./styles.module.css"
import Layout from "../../components/Layout";
import { firestoreAutoId } from "../../firebase/helpers";
import { getAllCaseTypes } from "../../firebase/queries";
import { stringify } from "querystring";

export default function IntakeHomeScreen() {
  const [caseForms, setCaseForms] = useState(new Map<string, any>());


  function removeForm(id) {
    let cloneMap = new Map<string, any>(caseForms);
    cloneMap.delete(id);
    setCaseForms(cloneMap);
  }

  const loadCases = async (): Promise<void> => {
    let cL: CaseType[] = await getAllCaseTypes();
    let copyMap= new Map<string, any>();
    cL.map(c => {
      let id = firestoreAutoId();
      copyMap.set(id, 
        <FormHolder
          formTitle={c.key}
          key={caseForms.size}
          id={id}
          deleteFunc={removeForm}/>
      );
    });
    setCaseForms(copyMap);
  };

  useEffect(() => {
    loadCases();
  }, []);
  
  return (
    <div>
        <h1>Intake Forms</h1>
        <div className={styles.buttondiv}>
          <Button variant="contained" onClick={() => {
            let copy = new Map(caseForms);
            let id = firestoreAutoId();
            copy.set(id, <FormHolder key={caseForms.size} deleteFunc={removeForm} id={id}/>);
            setCaseForms(copy);
          }}>
             Add New Form
          </Button>
        </div>
        {caseForms.size ? Array.from(caseForms.values()) : <span>Loading...</span>}
    </div>
  );
}

IntakeHomeScreen.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      {page} 
    </Layout>
  )
}