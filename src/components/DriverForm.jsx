import React from 'react';
import { Car, Mail, Phone, MapPin, Lock, Bus, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function DriverForm({ formData = { name: '', email: '', address: '', phone: '', password: '', busNumber: '' }, onChange, onSubmit, loading = false }) {
  if (!formData) return <div className="text-red-500">Form data is missing.</div>;
  
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Car className="h-4 w-4" />
            Driver Name
          </label>
          <Input
            type="text"
            name="name"
            placeholder="Enter driver name"
            value={formData.name}
            onChange={onChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </label>
          <Input
            type="email"
            name="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={onChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Address
        </label>
        <Input
          type="text"
          name="address"
          placeholder="Enter full address"
          value={formData.address}
          onChange={onChange}
          required
          disabled={loading}
          className="h-11"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </label>
          <Input
            type="tel"
            name="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={onChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Bus className="h-4 w-4" />
            Bus Number
          </label>
          <Input
            type="text"
            name="busNumber"
            placeholder="Enter bus number"
            value={formData.busNumber}
            onChange={onChange}
            required
            disabled={loading}
            className="h-11"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Password
        </label>
        <Input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={onChange}
          required
          disabled={loading}
          className="h-11"
        />
      </div>
      
      <Button 
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Adding Driver...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Driver
          </div>
        )}
      </Button>
    </form>
  );
} 