import { valueToPercent } from "@mui/base";
import { typography } from "@mui/system";
import { useRouter } from "next/router";
import { EventEmitter } from "stream";
import {
    Appointment,
    CalendlyLink,
    Case,
    CaseType,
    Client,
    Dictionary,
    Document,
    FirebaseQueryParams,
    Question,
    AnswerType,
    QuestionComponentProps,
    SirenUser
  } from '../../types';
import firebase from './clientApp';
import { objectToAnswerOptionsMap, objectToMap, mapToObject, firestoreAutoId, camelize } from './helpers';

  const database = firebase.firestore();
  const caseTypeCollection = database.collection('caseTypes');
  const clientCollection = database.collection('clients');
  const sirenUserCollection = database.collection('sirenUsers');

export const getClient = async (clientId: string): Promise<Client> => {
  try {
    const doc = await clientCollection.doc(clientId).get();
    const client = doc.data() as Client;
    client.answers = objectToMap(client.answers);
    return client;
  } catch (e) {
    console.warn(e);
    throw e;
  }
};

export const getAllClients = async (): Promise<Client[]> => {
  try {
    const ref = await clientCollection.get();
    return ref.docs.map((doc) => doc.data() as Client);
  } catch (e) {
    console.warn(e);
    throw e;
  }
};

export const getClientCases = async (clientId: string): Promise<Case[]> => {
  try {
    const ref = await clientCollection.doc(clientId).collection('cases').get();
    return ref.docs.map((doc) => doc.data() as Case);
  } catch (e) {
    console.warn(e);
    throw e;
  }
};

export const getClientCaseDocs = async (clientId: string, caseId: string): Promise<Document[]> => {
  try {
    const ref = await clientCollection.doc(clientId).collection('cases').doc(caseId).collection('documents').get();
    return ref.docs.map((doc) => doc.data() as Document);
  } catch (e) {
    console.warn(e);
    throw e;
  }
};

export const getCaseType = async (
  caseType: string
): Promise<CaseType> => {
  try {
    const doc = await caseTypeCollection.doc(caseType).get();
    const cType = doc.data() as CaseType;
    return cType;
  } catch (e) {
    console.warn(e);
    throw e;
  }
};

export const getAllCaseTypes = async (): Promise<CaseType[]> => {
  try {
    const ref = await caseTypeCollection.get();
    return ref.docs.map((doc) => doc.data() as CaseType);
  } catch (e) {
    console.warn(e);
    throw e;
  }
};

export const getAllQuestionsOfType = async (
  caseType: string
): Promise<QuestionComponentProps[]> => {
  try {
    const docs = await database.collection(`caseTypes/${caseType}/questions`);
    const ref = await docs.orderBy("order").get();
      const questions = ref.docs.map(doc => doc.data() as QuestionComponentProps);
      let i = 0;
      while(i < ref.docs.length) {
        let target = questions[i];
        target.id = ref.docs[i].id;
        target.displayText = objectToMap(target.displayText);
        target.description = objectToMap(target.description);
        target.example = objectToMap(target.example);
        target.answerOptions = objectToAnswerOptionsMap(target.answerOptions);
        i++;
      }
      return questions;
  } catch (e) {
    console.warn(e);
    throw e;
  }
};


export const getClientResponsesOfType = async (
  client: Client,
  caseType: string
): Promise<Map<string, any>> => {
  try {
    const answers: Map<string, Map<string, any>> = client.answers;
    if (answers && answers[caseType] !== undefined) {
      return answers[caseType];
    } else {
      return null;
    }
  } catch (e) {
    console.warn(e);
    throw e;
  }
};

export const getIdentifiers = async (
  clientId: string
): Promise<Array<Object>> => {
  try {
    let caseIds = new Array<Object>();
    const cases = await database.collection(`clients/${clientId}/cases`).get();
    const cliCases = cases.docs.map((c) => c.data());
    await cliCases.map((c) =>
      caseIds.push({ caseType: c.type, identifier: c.identifier })
    );
    return caseIds;
  } catch (e) {
    console.warn(e);
    throw(e);
  } 
}

export const getSirenUser = async (uid: string ) => {
  try {
    const doc = await sirenUserCollection.doc(uid).get();
    const sirenUser = doc.data() as SirenUser;
    return sirenUser;
  } catch (e) {
    console.warn(e);
    throw e;
  }
}

export const setSirenUser = async (sirenUser: SirenUser) => {
  try {
    await sirenUserCollection.doc(sirenUser.uid).set(sirenUser);
  } catch (e) {
    console.warn(e);
    throw e;
    // TODO: Add error handling.
  }
};

export const getSirenUsersWhere = async (params: FirebaseQueryParams[]): Promise<SirenUser[]> => {
  /*
  Takes in a list of FirebaseQueryParams. You can use this function to query collections with
  certain conditions. See https://firebase.google.com/docs/firestore/query-data/queries.
  An example usage is in in src/components/SirenUserTable/SirenUserTable.tsx.
  */
  if (params.length == 0) {
    return null;
  }
  try {
    var ref = sirenUserCollection;
    for (let i = 0; i < params.length; i++) {
      const { field, operator, value } = params[i];
      ref = await ref.where(field, operator, value);
    }
    ref = await ref.get();
    return ref.docs.map(doc => doc.data() as SirenUser);
  } catch (e) {
    console.warn(e);
    throw e;
    // TODO: Add error handling
  }
};


export const updateInfo = async(
  client: Client, 
  caseType: string,
  field: string, // field to be updated on client response
  newInfo: string,
) => {
  try{
    const copy = {...client} as Dictionary;
    copy.answers = mapToObject(client.answers);
    copy.answers[caseType][field] = newInfo;
    await clientCollection.doc(copy.id).set(copy);
  } catch(e){
    console.warn(e)
    throw(e)
  }
};

export const setQuestion = async (question: Question, maps: QuestionComponentProps) => {
  try {
    //Go through keys of map (all languages) and manually update each of Maps for each question. 
    //Flaw in design: can take a bit longer to load and if its interrupted, the Map based fields will be strings, but question components expect them to be Maps
    const firebaseQuestion = database
    .collection(`caseTypes/${question.questionType}/questions`)
    .doc(question.id);
    firebaseQuestion.set(question).then(() => {
      try {
        Array.from(maps.displayText.keys()).map(async k => {
          var mapUpdate = {};
          mapUpdate[`displayText.${k}`] = maps.displayText.get(k);
          mapUpdate[`description.${k}`] = maps.description.get(k);
          mapUpdate[`example.${k}`] = maps.example.get(k);
          mapUpdate[`answerOptions.${k}`] = maps.answerOptions.get(k);
          firebaseQuestion.update(mapUpdate);
        })
      } catch (e) {
        console.warn(e);
        throw e;
      }
    })
  } catch (e) {
    console.warn(e);
    throw e;
    // TODO: Add error handling.
  }
};

export const setCaseType = async (
  caseType: string
) => {
  try {
    let doc = caseTypeCollection.doc(camelize(caseType));
    doc.get().then((d) => {
      if (!d.exists) {
        doc.set({
          key: caseType,
          documentList: [],
          identifier: firestoreAutoId()
        })
      } 
    });
  } catch (error) {
    console.warn(error);
    throw error;
  }
}

export const renameCase = async (
  initialCaseType: string,
  caseQueryKey: string
) => {
  try {
    let initialDoc = caseTypeCollection.doc(camelize(initialCaseType));
    let recentDoc = caseTypeCollection.doc(camelize(caseQueryKey));
    initialDoc.get().then((doc) => {
      initialDoc.collection('questions').get().then(c => {
        if (c.empty || !doc || !doc.exists) {
          return;
        } else {
          c.forEach(docSnapshot => {
            recentDoc.collection('questions').add(docSnapshot.data());
            docSnapshot.ref.delete();
          })
        }
      }).then(() => {
        var data = doc.data();
        recentDoc.set(data, {mergeFields: ['documentList', 'identifier']}).then(() => {
          initialDoc.delete();
          window.location.reload();
        })
      })
    })
  } catch (error) {
    console.warn(error);
    throw error;
  }}

export const deleteCase = async (key: string) => {
  try {
    await caseTypeCollection.doc(camelize(key)).delete();
  } catch (e) {
    console.warn(e);
    throw e;
    // TODO: Add error handling.
  }
};

export const deleteQuestion = async (id:string, questionType: string) => {
  try {
    await database
      .collection(`caseTypes/${questionType}/questions`)
      .doc(id)
      .delete();
  } catch (e) {
    console.warn(e);
    throw e;
    // TODO: Add error handling.
  }
};


