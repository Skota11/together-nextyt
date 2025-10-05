"use client";

import { Button } from "@heroui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-4">
      <Button color="primary">Primary Button</Button>
      <Button color="secondary">Secondary Button</Button>
      <Button color="success">Success Button</Button>
      <Button color="danger">Danger Button</Button>
    </div>
  );
}
