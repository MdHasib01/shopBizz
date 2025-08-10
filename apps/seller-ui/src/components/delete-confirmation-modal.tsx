import React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const DeleteConfirmationModal = ({
  product,
  showDeleteModal,
  setShowDeleteModal,
  onConfirm,
  onRestore,
  isDeleting,
  isRestoring,
}: any) => {
  return (
    <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to delete this product ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This product will be moved to ad <b>Delete State</b>, and
            permanently removed after <b>24 hours</b>. You can recover it within
            this time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {product?.isDeleted ? (
            <AlertDialogAction
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              onClick={onRestore}
            >
              {isRestoring ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={onConfirm}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationModal;
