import React, { useState } from 'react';
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from "./FormHolder.module.css";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { camelize } from '../../firebase/helpers';
import { deleteCase, renameCase, setCaseType } from '../../firebase/queries';
import { TextareaAutosize } from '@mui/material';

interface FormHolderProps {
    formTitle?: string,
}

const FormHolder = ({formTitle="New Case Type"}: FormHolderProps) => {
    const [titleText, setTitleText] = useState(formTitle);
    const router = useRouter();
    router.query.key = formTitle;
    return (
        <div className={styles.root}>
            <div className={styles.title}>
                <FeedOutlinedIcon />
                <TextareaAutosize
                    value={titleText}
                    className={styles.titleText}
                    placeholder="New Case Type"
                    onChange={(e) => {
                        setTitleText(e.target.value);
                        formTitle=e.target.value;
                        router.query.key = e.target.value;
                    }}
                    />
            </div>
            <div className={styles.icons}>                
                <Link href={{
                     pathname: "/IntakeForms/IntakeForm",
                     query: {key: titleText, uploaded: 'false'}
                     }}>
                    <a onClick={() => {
                        setCaseType(titleText).then(() => {
                            if (!(formTitle === titleText)) {
                                renameCase(formTitle, titleText).then(() => {
                                    router.query.key = titleText;
                                });
                            }
                            router.query.key = titleText;
                        });
                    }}>
                        <EditIcon />
                    </a>
                </Link>
                <button onClick={() =>{deleteCase((router.query.key).toString())}}>
                    <DeleteIcon />
                </button>
            </div>
        </div>
    )
}

export default FormHolder 