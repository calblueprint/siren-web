import React, { useEffect, useState } from "react";
import Link from "next/dist/client/link";
import styles from "./IntakeForm.module.css";
import { IoIosArrowBack, IoIosAddCircleOutline } from "react-icons/io";
import { IoEyeOutline } from "react-icons/io5";
import { BiUndo, BiRedo } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import Button from "../Button/Button";
import { LinkForm } from "../LinkForm/LinkForm";
import TextareaAutosize from "react-textarea-autosize";
import Question from "../Question/question";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Image from "next/image";
import dragDots from "../../../assets/images/dragDots.png";

const IntakeForm = () => {
  const [titleText, setTitleText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionIds, setQuestionIds] = useState([]);

  function addQuestion() {
    const id: string = Math.random().toString(36).slice(2).valueOf();
    let list = [...questions];
    let ids = [...questionIds];
    list.push(<Question />);
    ids.push(id);
    setQuestions(list);
    setQuestionIds(ids);
  }

  const getDraggable = (question, index) => {
    return (
      <Draggable
        key={questionIds[index]}
        index={index}
        draggableId={questionIds[index]}
      >
        {(provided, snapshot) => {
          if (snapshot.isDragging) {
            const offset = {
              x: -1 * (window.innerWidth * 0.193),
              y: -1 * (window.innerHeight * 0.01),
            };
            const x = provided.draggableProps.style.left - offset.x;
            const y = provided.draggableProps.style.top - offset.y;
            provided.draggableProps.style.left = x;
            provided.draggableProps.style.top = y;
          }
          return (
            <div
              {...provided.draggableProps}
              ref={provided.innerRef}
              className={styles.container}
            >
              <div className={styles["dragDots"]} {...provided.dragHandleProps}>
                <Image src={dragDots} alt="draghere" />
              </div>
              {question}
            </div>
          );
        }}
      </Draggable>
    );
  };

  const reorder = (list, source, destination) => {
    const newList = Array.from(list);
    const [movedItem] = newList.splice(source, 1);
    newList.splice(destination, 0, movedItem);
    return newList;
  };

  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!result.destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const newQuestions = reorder(questions, source.index, destination.index);
    const newQuestionIds = reorder(
      questionIds,
      source.index,
      destination.index
    );
    setQuestions(newQuestions);
    setQuestionIds(newQuestionIds);
  };

  function Overlay() {
    return (
      <div className={styles["overlay"]}>
        <div className={styles["namebar"]}>
          <Link href="/">
            <IoIosArrowBack color="#0F2536" />
          </Link>
          <TextareaAutosize
            cacheMeasurements
            value={titleText}
            placeholder="Untitled"
            onChange={(ev) => setTitleText(ev.target.value)}
            className={styles["title"]}
          />
        </div>
        <div className={styles["changebar"]}>
          <IoEyeOutline size={36} />
          <BiUndo size={33} />
          <BiRedo size={33} />
          <button className={styles["add-button"]} onClick={addQuestion}>
            <IoIosAddCircleOutline size={33} />
          </button>
          <Button
            text="Save Changes"
            buttonType="button-clear"
            textType="button-text-jet"
            onPress={() => alert("SAVE!")}
          />
          <Button
            text="Publish Changes"
            buttonType="button-pruss"
            textType="button-text-white"
            onPress={() => alert("PUBLISH!")}
          />
          <BsThreeDotsVertical size={30} />
        </div>
        <LinkForm />
      </div>
    );
  }

  return (
    <DragDropContext className={styles["context"]} onDragEnd={onDragEnd}>
      <div className={styles["page"]}>
        {Overlay()}
        <div className={styles["spacer"]} />
        <Droppable droppableId="questionsList">
          {(droppableProvided) => (
            <div
              className={styles["questions"]}
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {questions.map((q, index) => getDraggable(q, index))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default IntakeForm;
