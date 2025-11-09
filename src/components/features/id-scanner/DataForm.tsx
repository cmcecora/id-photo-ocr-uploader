import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Form validation schema
const idDataSchema = z.object({
  id: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  firstName: z.string().min(1, 'First name is required'),
  middleInitial: z.string().max(1).optional(),
  addressStreet: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  sex: z.enum(['M', 'F', 'Male', 'Female']).optional(),
  dob: z.string().optional()
});

type FormData = z.infer<typeof idDataSchema>;

interface DataFormProps {
  initialData?: FormData;
  onDataSave?: (data: FormData) => void;
  readonly?: boolean;
  confidence?: number;
}

const STATE_OPTIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const DataForm: React.FC<DataFormProps> = ({
  initialData,
  onDataSave,
  readonly: initialReadonly = true,
  confidence
}) => {
  const [isReadonly, setIsReadonly] = useState(initialReadonly);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(idDataSchema),
    defaultValues: initialData || {},
    mode: 'onChange'
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Track changes
  useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  const handleEdit = () => {
    setIsReadonly(false);
  };

  const handleCancel = () => {
    reset(initialData || {});
    setIsReadonly(true);
    setHasChanges(false);
  };

  const handleSave = async (data: FormData) => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/id/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to save data');
      }

      const result = await response.json();

      if (result.success) {
        toast.success('ID data saved successfully!');
        setIsReadonly(true);
        setHasChanges(false);
        onDataSave?.(data);
      } else {
        throw new Error('Save operation failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickEdit = (field: keyof FormData, value: string) => {
    if (!isReadonly) {
      setValue(field, value);
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return 'No confidence data';
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  const isFormEmpty = !watch('lastName') && !watch('firstName') && !watch('id');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Extracted Information
            {confidence && (
              <span className={cn(
                "text-sm font-normal",
                getConfidenceColor(confidence)
              )}>
                ({getConfidenceLabel(confidence)})
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {isReadonly && !isFormEmpty && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            )}
            {!isReadonly && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit(handleSave)}
                  disabled={isSaving || !hasChanges}
                  className="flex items-center gap-1"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      Save
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isFormEmpty ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No data extracted yet.</p>
            <p className="text-sm">Upload an ID photo to get started.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
            {/* ID Number */}
            <div className="space-y-2">
              <Label htmlFor="id">ID Number</Label>
              <Input
                id="id"
                {...register('id')}
                readOnly={isReadonly}
                className={cn(
                  isReadonly && "bg-gray-50 cursor-not-allowed"
                )}
                placeholder="Enter ID number"
              />
              {errors.id && (
                <p className="text-sm text-red-500">{errors.id.message}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  readOnly={isReadonly}
                  className={cn(
                    isReadonly && "bg-gray-50 cursor-not-allowed",
                    errors.firstName && "border-red-500"
                  )}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  readOnly={isReadonly}
                  className={cn(
                    isReadonly && "bg-gray-50 cursor-not-allowed",
                    errors.lastName && "border-red-500"
                  )}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleInitial">Middle Initial</Label>
              <Input
                id="middleInitial"
                {...register('middleInitial')}
                readOnly={isReadonly}
                className={cn(
                  isReadonly && "bg-gray-50 cursor-not-allowed"
                )}
                placeholder="MI"
                maxLength={1}
              />
              {errors.middleInitial && (
                <p className="text-sm text-red-500">{errors.middleInitial.message}</p>
              )}
            </div>

            {/* Address Fields */}
            <div className="space-y-2">
              <Label htmlFor="addressStreet">Street Address</Label>
              <Input
                id="addressStreet"
                {...register('addressStreet')}
                readOnly={isReadonly}
                className={cn(
                  isReadonly && "bg-gray-50 cursor-not-allowed"
                )}
                placeholder="123 Main St"
              />
              {errors.addressStreet && (
                <p className="text-sm text-red-500">{errors.addressStreet.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="addressCity">City</Label>
                <Input
                  id="addressCity"
                  {...register('addressCity')}
                  readOnly={isReadonly}
                  className={cn(
                    isReadonly && "bg-gray-50 cursor-not-allowed"
                  )}
                  placeholder="City"
                />
                {errors.addressCity && (
                  <p className="text-sm text-red-500">{errors.addressCity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressState">State</Label>
                {!isReadonly ? (
                  <Select
                    value={watch('addressState') || ''}
                    onValueChange={(value) => setValue('addressState', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATE_OPTIONS.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="addressState"
                    {...register('addressState')}
                    readOnly={isReadonly}
                    className="bg-gray-50 cursor-not-allowed"
                    placeholder="State"
                  />
                )}
                {errors.addressState && (
                  <p className="text-sm text-red-500">{errors.addressState.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressZip">ZIP Code</Label>
                <Input
                  id="addressZip"
                  {...register('addressZip')}
                  readOnly={isReadonly}
                  className={cn(
                    isReadonly && "bg-gray-50 cursor-not-allowed"
                  )}
                  placeholder="12345"
                />
                {errors.addressZip && (
                  <p className="text-sm text-red-500">{errors.addressZip.message}</p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                {!isReadonly ? (
                  <Select
                    value={watch('sex') || ''}
                    onValueChange={(value) => setValue('sex', value as 'M' | 'F' | 'Male' | 'Female')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="sex"
                    {...register('sex')}
                    readOnly={isReadonly}
                    className="bg-gray-50 cursor-not-allowed"
                    placeholder="Sex"
                  />
                )}
                {errors.sex && (
                  <p className="text-sm text-red-500">{errors.sex.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  {...register('dob')}
                  type="date"
                  readOnly={isReadonly}
                  className={cn(
                    isReadonly && "bg-gray-50 cursor-not-allowed"
                  )}
                />
                {errors.dob && (
                  <p className="text-sm text-red-500">{errors.dob.message}</p>
                )}
              </div>
            </div>

            {/* Hidden submit button for form submission */}
            <button type="submit" className="hidden" />
          </form>
        )}
      </CardContent>
    </Card>
  );
};