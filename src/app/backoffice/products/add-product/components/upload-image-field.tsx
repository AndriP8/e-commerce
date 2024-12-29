"use client";

import { Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useReducer, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

import { useProductImageMutation } from "../data/data-mutation";
import { initialState, uploadReducer } from "../reducers/upload-reducer";
import { FileWithPreview } from "../reducers/upload-reducer";
import { AddProductSchema } from "../schema";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = "image/jpeg, image/jpg, image/png, image/webp";

export function UploadImageField({ session }: { session: string }) {
  const [state, dispatch] = useReducer(uploadReducer, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useFormContext<AddProductSchema>();

  const { uploadImage, deleteImage } = useProductImageMutation(session);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const validFiles: File[] = [];
      let errors = "";
      files.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          errors = `Filename ${file.name} exceed the 10MB limit`;
        } else if (
          state.files.some((f) => f.file.name === file.name && file.size > 0)
        ) {
          errors = `Filename ${file.name} already exists`;
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length) {
        toast({
          title: "Error",
          description: errors,
          variant: "destructive",
        });
      }

      const filesWithPreview: FileWithPreview[] = validFiles.map((file) => {
        return {
          file,
          id: `${uuidv4()}-${file.name}`,
          preview: URL.createObjectURL(file),
        };
      });

      dispatch({ type: "ADD_FILES", payload: filesWithPreview });
    },
    [state.files],
  );

  const handleUpload = useCallback(() => {
    dispatch({ type: "SET_UPLOADING", payload: true });
    state.files.forEach((file) => {
      if (!state.uploaded.includes(file.id)) {
        uploadImage({
          file,
          onProgress: (id, progress) => {
            dispatch({ type: "UPDATE_PROGRESS", payload: { id, progress } });
          },
          onComplete: (id) => {
            dispatch({ type: "SET_UPLOADED", payload: id });
            const previousImages = form.watch("images");
            form.setValue("images", [...previousImages, id]);
          },
          onError: (id, error) => {
            dispatch({ type: "SET_ERROR", payload: { id, error } });
          },
        });
      }
    });
  }, [form, state.files, state.uploaded, uploadImage]);

  const handleDeleteNonUploaded = (id: string) => {
    dispatch({ type: "REMOVE_FILE", payload: id });
  };

  const handleDeleteUploaded = (id: string) => {
    deleteImage({
      id,
      onComplete: () => {
        dispatch({ type: "REMOVE_FILE", payload: id });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete the image. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter((file) => file.size <= MAX_FILE_SIZE);

    if (validFiles.length < files.length) {
      toast({
        title: "Error",
        description:
          "Some files were skipped because they exceed the 10MB limit.",
        variant: "destructive",
      });
    }

    const filesWithPreview: FileWithPreview[] = validFiles.map((file) => ({
      file,
      id: `${uuidv4()}-${file.name}`,
      preview: URL.createObjectURL(file),
    }));

    dispatch({ type: "ADD_FILES", payload: filesWithPreview });
  };

  return (
    <div className="space-y-2">
      <Label>
        Product Images <span className="text-red-500">*</span>
      </Label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={ACCEPTED_FILE_TYPES}
          multiple
          className="hidden"
        />
        <p>Click or drag and drop images here</p>
        <p className="text-sm text-gray-500">Max file size: 10MB</p>
      </div>
      {form.formState.errors.images && (
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors.images.message}
        </p>
      )}
      {/* List Image */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {state.files.map((file) => (
          <div key={file.id} className="relative w-full h-32">
            <Image
              src={file.preview}
              alt={file.file.name}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              {state.uploaded.includes(file.id) ? (
                <button
                  onClick={() => handleDeleteUploaded(file.id)}
                  className="text-white bg-red-500 rounded-full p-1"
                  type="button"
                >
                  <Trash2 size={20} />
                </button>
              ) : (
                <button
                  onClick={() => handleDeleteNonUploaded(file.id)}
                  className="text-white bg-red-500 rounded-full p-1"
                  type="button"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            {state.progress[file.id] && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-b-lg">
                <div
                  className="h-full bg-blue-500 rounded-b-lg"
                  style={{ width: `${state.progress[file.id]}%` }}
                ></div>
              </div>
            )}
            {state.uploaded.includes(file.id) && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Uploaded
              </div>
            )}
            {state.errors[file.id] && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                Error
              </div>
            )}
          </div>
        ))}
      </div>

      {state.files.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={
            state.uploading || state.files.length === state.uploaded.length
          }
          variant="outline"
          type="button"
        >
          <Upload size={20} className="mr-2" />
          {state.uploading ? "Uploading..." : "Upload"}
        </Button>
      )}
    </div>
  );
}
