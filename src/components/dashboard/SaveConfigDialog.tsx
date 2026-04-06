import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SaveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, comment: string) => void;
  defaultName: string;
}

const SaveConfigDialog: React.FC<SaveConfigDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  defaultName,
}) => {
  const [name, setName] = useState(defaultName);
  const [comment, setComment] = useState('');

  React.useEffect(() => {
    if (open) {
      setName(defaultName);
      setComment('');
    }
  }, [open, defaultName]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), comment.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Save Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="config-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="config-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Projections – Southeast IDNs"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="config-comment" className="text-sm font-medium">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="config-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any context or assumptions for this save..."
              rows={3}
              className="resize-none text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveConfigDialog;
