import Head from 'next/head'
import {
  PageContainer
} from './styles';
import styles from '../styles/Home.module.css'
import firebase from '../firebase/clientApp'
import { useCollection } from "react-firebase-hooks/firestore";
import IntakeItem from './IntakeDashboard/IntakeItem/IntakeItem';
import {IntakeTable} from './IntakeDashboard/IntakeTable/IntakeTable';


export default function Home() {

  //Retrieves firestore collection called 'clients'
  const [clients, clientLoading, clientError] = useCollection(
    firebase.firestore().collection("clients"),
    {}
  );

  if (!clientLoading && clients) {
    clients.docs.map((doc) => console.log(doc.data()));
  }


  return (
    <PageContainer>
      {/* <Head>
        <title>SIREN Admin</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          SIREN Admin
        </h1>
      </main>  */}
      <IntakeTable/>
    </PageContainer>
  )
}