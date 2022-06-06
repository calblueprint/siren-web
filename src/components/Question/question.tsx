import TextareaAutosize from "react-textarea-autosize";
import React, { useState } from "react";
import styles from "./styles.module.css";
import Select from "react-select";
import {
  IoCloseOutline,
  IoRadioButtonOffOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import { MdOutlineCheckBoxOutlineBlank, MdContentCopy } from "react-icons/md";
import { IoTrashOutline } from "react-icons/io5";
import "react-toggle/style.css";
import { firestoreAutoId } from "../../firebase/helpers";
import { QuestionComponentProps, Language } from "../../../types";
import {updateMap as changeMap} from "../IntakeForm/IntakeForm";
import Toggle from 'react-toggle';
import "react-toggle/style.css";


const Question = ({
  id,
  //Referred to within component because this is a map.  Same as QuestionText.  New Map created in Intake Form.  (Applies to all map-based fields)
  displayText, 
  description,
  example,
  questionType,
  key = firestoreAutoId(),
  order,
  active = false,
  answerType = null,
  answerOptions,
  language = Language.English, //Isn't changed after being passed in, languageOption handles all language changes.
  deleteFunc,
}:QuestionComponentProps,
) => {
  const updateMap = changeMap;
  const [questionText, setQuestionText] = useState(displayText.get(language));
  const [descriptionText, setDescriptionText] = useState(description.get(language));
  const [answerOption, setAnswerOption] = useState(answerOptions.get(language));
  const [required, setRequired] = useState(active);
  const answerTypeOptions = [ //Value is used for firebase, label for frontend.
    { value: "smallInput", label: "Short answer" },
    { value: "date", label: "Date" },
    { value: "radio", label: "Multiple Choice" },
    { value: "largeInput", label: "Long answer" },
    { value: "dropdown", label: "Dropdown" },
  ];
  const [typeOfAnswer, setAnswerType] =
   useState(answerType === null ? null : 
    answerTypeOptions[answerTypeOptions.findIndex(o => {return o.value === answerType})]);
  const languageOptions = [
    {value: "EN", label: "English"},
    {value: "ES", label: "Spanish"},
    {value: "VIET", label: "Vietnamese"},
  ]; 
  const [languageOption, setLanguage] = useState(
    languageOptions[languageOptions.findIndex(o => {return o.value === language})]); //  Matches initial label toggle to given backend (backend values to frontend labels).  
  const reloadLanguage = (lang) => {
    setQuestionText(displayText.get(lang));
    setDescriptionText(description.get(lang));
    setAnswerOption(answerOptions.get(lang));
  }
  const getAnswerOptions = (icon) => {
    let components = [];
    for (let i = 0; i < answerOption.length; i++) {
      components.push(
        <div className={styles.bottomcontainericon} key={i}>
          {icon}
          <TextareaAutosize
            cacheMeasurements
            value={answerOption[i]}
            className={styles.multiText}
            placeholder="Option"
            onChange={(ev) => {
              let options = [...answerOption];
              options[i] = ev.target.value;
              setAnswerOption(options);
              answerOptions.set(languageOption.value, options);
              updateMap(id, "answerOptions", answerOptions);
            }}
          />
          <button
            onClick={() => {
              let options = [...answerOption];
              options.splice(i, 1);
              setAnswerOption(options);
              answerOptions.set(languageOption.value, answerOption);
              updateMap(id, "answerOptions", answerOptions);
            }}
            className={styles.removeOption}
          >
            <IoCloseOutline size="16px" />
          </button>
        </div>
      );
    }
    return components;
  };

  const getAnswerTypeComponent = () => {
    if (typeOfAnswer.value === "smallInput") {
      return (
        <div className={styles.bottomcontainerrow}>
          <TextareaAutosize
            cacheMeasurements
            readOnly
            value="Short answer text"
            className={styles.shortText}
          />
        </div>
      );
    } else if (typeOfAnswer.value === "largeInput") {
      return (
        <div className={styles.bottomcontainerrow}>
          <TextareaAutosize
            cacheMeasurements
            readOnly
            value="Long answer text"
            className={styles.longText}
          />
        </div>
      );
    } else if (typeOfAnswer.value === "date") {
      return (
        <div className={styles.bottomcontainerrow}>
          <TextareaAutosize
            cacheMeasurements
            readOnly
            value="MM/DD/YYYY"
            className={styles.shortText}
          />
          <div className={styles.calendardiv}>
            <IoCalendarOutline size="20px" />
          </div>
        </div>
      );
    } else {
      const icon =
        typeOfAnswer.value === "radio" ? (
          <IoRadioButtonOffOutline size="20px" />
        ) : typeOfAnswer.value === "checkbox" ? (
          <MdOutlineCheckBoxOutlineBlank size="20px" />
        ) : null;
      return (
        <div className={styles.bottomcontainercolumn}>
          {getAnswerOptions(icon)}
          <button
            className={styles.addOption}
            onClick={() => {
              let options = [...answerOption];
              options.push("Option");
              setAnswerOption(options);
              answerOptions.set(languageOption.value, options);
              updateMap(id, "answerOptions", answerOptions);
            }}
          >
            + Add Option
          </button>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topcontainer}>
        <TextareaAutosize
          cacheMeasurements
          value={questionText}
          placeholder="Question"
          onChange={ev => {
            setQuestionText(ev.target.value);
            displayText.set(languageOption.value, ev.target.value);
            updateMap(id, "displayText", displayText);
          }}
          className={styles.questionText}
        />
        <Select
          options={answerTypeOptions}
          onChange={e => {setAnswerType(e); updateMap(id, "answerType", e.value)}}
          defaultValue={typeOfAnswer}
          className={styles.options}
        />
        <Select
          options={languageOptions}
          onChange={e => {
            reloadLanguage(e.value); // Reload front-end fields to new lang.
            setLanguage(e); // change current language (handled languageOption)
            updateMap(id, "language", e.value)}} // Updates backend obj map in intakeForm.
          defaultValue={languageOption} 
          className={styles.options}
        />
      </div>
      <div className={styles.middlecontainer}>
        <TextareaAutosize
          cacheMeasurements
          value={descriptionText}
          placeholder="Description"
          onChange={(ev) => {
            setDescriptionText(ev.target.value);
            description.set(languageOption.value, ev.target.value);
            updateMap(id, "description", description)}}
          className={styles.longText}
        />
      </div>
      {typeOfAnswer ? getAnswerTypeComponent() : null}
      <div className={styles.bottombuttons}>
					        <span className={styles.requiredspan}>Required</span>
                  <Toggle
                    checked={required}
                    icons={false}
                    onChange={() => {
                      active=!required;
                      setRequired(active);
                      updateMap(id, "active", active);
                    }}
                  />
                  <button className={styles.copybutton}>
                    <MdContentCopy size="27px"/>
                  </button>
                  <button 
                    className={styles.trashbutton}
                    onClick={() => {
                      deleteFunc(id);
                      }}>
                    <IoTrashOutline size="27px"/>
                  </button>
			          </div>
    </div>
  );
};

export default Question;
