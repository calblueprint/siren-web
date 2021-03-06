import React, { useEffect, useReducer } from 'react';
import Link from 'next/dist/client/link';
import styles from "./IntakeForm.module.css";
import { IoIosArrowBack, IoIosAddCircleOutline,  } from "react-icons/io";
import { IoEyeOutline } from "react-icons/io5";
import { BiUndo, BiRedo } from "react-icons/bi";
import {BsThreeDotsVertical} from "react-icons/bs";
import Button from "../Button/Button";
import TextareaAutosize from 'react-textarea-autosize';
import  Question from "../Question/question";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Image from "next/image";
import dragDots from "../../../assets/images/dragDots.png";
import { setQuestion, getAllQuestionsOfType, deleteQuestion} from "../../firebase/queries";
import { firestoreAutoId, mapToJSON } from '../../firebase/helpers';
import { AnswerType, QuestionType, QuestionComponentProps as QuestionObj, Language,  } from "../../../types";


enum IntakeActionTypes {
  ADD = "add",
  REMOVE = "remove",
  UNDO = "undo",
  REDO = "redo",
  LOAD = "load"
}

var questionMap = new Map<string, QuestionObj>();
const deletionList = [];

export const updateMap = (id, field, value) => {
  questionMap.get(id)[field] = value;
  console.log("language change", questionMap.get(id));
}


const IntakeForm = (caseType) => {
  caseType = caseType.caseType;
  function getTitle(caseType) {
    switch(caseType) {
      case QuestionType.General:
        return "General";
      case QuestionType.Daca: 
        return "Daca Renewal";
      case QuestionType.Adjustment:
        return "Adjustment Of Status";
      default:
        return "I90";
    }
  }
  const titleText = getTitle(caseType);
  var initialState = {
    ids: [],
    questions: [],
    past: [],
    future: []
  }
  const [qState, dispatch] = useReducer(intakeReducer, initialState);
  const loadQuestions = async (): Promise<void> => {
    let qs: QuestionObj[] = await getAllQuestionsOfType(caseType);
    questionMap = new Map<string, QuestionObj>();
    qs = qs.filter(q => (!deletionList.includes(q.id) && !qState.ids.includes(q.id)));
    qs.map(q => questionMap.set(q.id, q));
    dispatch({type: IntakeActionTypes.LOAD, payload: qs})    
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  

  async function setQuestions(){
    Array.from(questionMap.values()).map(q => {
      deletionList.includes(q.id) ?
       deleteQuestion(q.id, q.questionType):
       setQuestion({
        id: q.id,
        displayText: mapToJSON(q.displayText),
        description: mapToJSON(q.description),
        example: mapToJSON(q.example),
        questionType: q.questionType,
        key: q.key,
        order: q.order,
        active: q.active,
        answerType: q.answerType,
        answerOptions: mapToJSON(q.answerOptions),
        language: q.language
       }, q)});
    
    window.alert("Questions Uploaded :D")

  }

  function removeComponent(id){
    dispatch({type: IntakeActionTypes.REMOVE, payload: id});
    deletionList.push(id);
  }


  const getDraggable = (question, index) => {
    return (
      <Draggable key={qState.ids[index]} index ={index} draggableId={qState.ids[index]}>
         {(provided, snapshot) => {
          if (snapshot.isDragging) {
              const offset = { x: -1*(window.innerWidth * 0.193) , y: -1*(window.innerHeight*0.01) }
              const x = provided.draggableProps.style.left - offset.x;
              const y = provided.draggableProps.style.top - offset.y;
              provided.draggableProps.style.left = x;
              provided.draggableProps.style.top = y;
           }
           return (
              <div
              {...provided.draggableProps}
              ref={provided.innerRef}
              className={styles.container}>
                <div 
                className={styles["dragDots"]}
                {...provided.dragHandleProps}
                >
                  <Image 
                  src={dragDots} 
                  alt="draghere"/>
                </div>
                {question}
              </div>
           );
       }}
      </Draggable>
    )
  }
  
  function intakeReducer(state, action){
    var newState = {
      ids: [...state.ids],
      questions: [...state.questions],
      past: [...state.past],
      future: [...state.future]
    }
    switch (action.type) {
      case IntakeActionTypes.ADD:
        newState.past.push([newState.ids, newState.questions])
        newState.ids.push(action.payload);
        newState.questions.push
        (<Question
          id={action.payload}
          displayText={new Map([['EN', ''], ['ES', ''], ['VIET', '']])}
          description={new Map([['EN', ''], ['ES', ''], ['VIET', '']])}
          example={new Map([['EN', ''], ['ES', ''], ['VIET', '']])} 
          questionType={caseType}
          order={newState.questions.length} 
          answerOptions={new Map([['EN', ['Option']], ['ES', ['Option']], ['VIET', ['Option']]])}
          deleteFunc={removeComponent}
          />);
        newState.future=[];
        return newState;
      case IntakeActionTypes.REMOVE:
        newState.past.push([newState.ids, newState.questions])
        const targetIndex = newState.ids.findIndex(q => q === action.payload);
        newState.ids.splice(targetIndex, 1);
        newState.questions.splice(targetIndex, 1);
        newState.future=[];
        return newState;
      case IntakeActionTypes.UNDO:
        if (newState.past.length > 0) {
          let pastState = newState.past.pop();
          newState.future.push([newState.ids, newState.questions]);
          newState.ids = pastState[0];
          newState.questions = pastState[1];
        }
        return newState;
      case IntakeActionTypes.REDO:
        if (newState.future.length > 0) {
          let futureState = newState.future.pop();
          newState.past.push([newState.ids, newState.questions]);
          newState.ids = futureState[0];
          newState.questions = futureState[1];
        }
        return newState;
      case IntakeActionTypes.LOAD:
        action.payload.map(q => {
          newState.ids.push(q.id);
          newState.questions.push
          (<Question 
            id={q.id}
            displayText={q.displayText}
            description={q.description}
            example={q.example}
            questionType={q.questionType}
            key={q.key}
            order={q.order}
            active={q.active}
            answerType={q.answerType}
            answerOptions={q.answerOptions}
            language={q.language}
            deleteFunc={removeComponent}
            />)} )
        return newState;


      default:
        return state;
    }
  }

  const reorder = (list, source, destination) => {
    const newList = Array.from(list);
    const [movedItem] = newList.splice(source, 1);
    newList.splice(destination, 0, movedItem);
    return newList;
  }

  const onDragEnd = (result) => {
    const { destination, source} = result;
    if (!result.destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const newQuestions = reorder(qState.questions, source.index, destination.index);
    const newQuestionIds = reorder(qState.ids, source.index, destination.index);
    qState.questions = newQuestions;
    qState.ids = newQuestionIds;
    questionMap.get(qState.ids[source.index]).order = source.index;
    questionMap.get(qState.ids[destination.index]).order = destination.index;
  }

  function Overlay() {
    return(
      <div className={styles["overlay"]}>
          <div className={styles["namebar"]}>
            <Link href="/">
              <IoIosArrowBack color="#0F2536"/>
            </Link>
            <TextareaAutosize
              cacheMeasurements
              value={titleText}
              // placeholder="Untitled"
              // onChange={ev => setTitleText(ev.target.value)}
              className={styles["title"]}/>
          </div>
          <div className={styles["changebar"]}>
            <IoEyeOutline size={36} />
            <button
              className={styles["undo-redo"]}
              onClick={() => dispatch({type: IntakeActionTypes.UNDO})}>
              <BiUndo size={33}/>
            </button>
            <button
              className={styles["undo-redo"]}
              onClick={() => dispatch({type: IntakeActionTypes.REDO})}>
              <BiRedo size={33}/>
            </button>
            <button
              className={styles["add-button"]}
              onClick={() => {
                let sharedID = firestoreAutoId();
                questionMap.set(sharedID, {
                  id: sharedID,
                  displayText: new Map([['EN', ''], ['ES', ''], ['VIET', '']]),
                  description: new Map([['EN', ''], ['ES', ''], ['VIET', '']]),
                  example: new Map([['EN', ''], ['ES', ''], ['VIET', '']]),
                  questionType: caseType,
                  key: firestoreAutoId(),
                  order: qState.questions.length,
                  active: false,
                  answerType: AnswerType.Null,
                  answerOptions: new Map([['EN', ['Option']], ['ES', ['Option']], ['VIET', ['Option']]]),
                  language: Language.English,
                  deleteFunc: removeComponent,
                });
                dispatch({type: IntakeActionTypes.ADD, payload: sharedID});

                }}>
              <IoIosAddCircleOutline size={33}/>
            </button>
            <Button
              text='Save Changes'
              buttonType='button-clear'
              textType='button-text-jet'
              onPress={() => alert("SAVE!")}
            />
            <Button
              text='Publish Changes'
              buttonType='button-pruss'
              textType='button-text-white'
              onPress={() => setQuestions()}
            />
            <BsThreeDotsVertical size={30}/>
          </div>
        </div>
    )
  }

  return (
    <DragDropContext
    className={styles["context"]}
    onDragEnd={onDragEnd}>
      <div className={styles["page"]}>
        {Overlay()}
        <div className={styles["spacer"]}/>
        <Droppable
        droppableId="questionsList"
        >
          {(droppableProvided) => (
            <div
            className={styles["questions"]}
            {...droppableProvided.droppableProps}
            ref={droppableProvided.innerRef}
            >
              {qState.questions.map((q, index) => (getDraggable(q, index)))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
} 

export default IntakeForm;