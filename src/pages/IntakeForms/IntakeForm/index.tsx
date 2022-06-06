import { useRouter } from "next/router";
import React, { useState } from "react";
import IntakeForm from "../../../components/IntakeForm/IntakeForm";

export default function IntakeScreen() {
  const router = useRouter();
  return (
    <div>
      <div>
        <IntakeForm/>
      </div>
    </div>
  );
}
