import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck, Warehouse, Info, ChevronDown, CheckCircle, Sprout, UserCheck, UserPlus, ShieldCheck, Home, Eye, EyeOff, MapPin, FileText, Globe, Search, X } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import countryData from '@/lib/countryData.json';

// Enhanced African countries data - add these to your existing countryData.json or use as is
const enhancedAfricanCountries = [
  // Togo
  {
    "name": "Togo",
    "code": "TG",
    "dial_code": "+228",
    "phone_length": 8,
    "regions": ["Maritime", "Plateaux", "Centrale", "Kara", "Savanes"],
    "documents": {
      "ID Card": {
        "label": "Carte d'Identité",
        "placeholder": "TG-1234567",
        "regex": "^TG-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "TG1234567",
        "regex": "^TG[A-Z0-9]{8,9}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "TG-DL-123456",
        "regex": "^TG-DL-[0-9]{6}$"
      }
    }
  },
  // Nigeria
  {
    "name": "Nigeria",
    "code": "NG",
    "dial_code": "+234",
    "phone_length": 10,
    "regions": ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"],
    "documents": {
      "ID Card": {
        "label": "National ID Number",
        "placeholder": "12345678901",
        "regex": "^[0-9]{11}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "A12345678",
        "regex": "^[A-Z][0-9]{8}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "NIG-12345678-A",
        "regex": "^NIG-[0-9]{8}-[A-Z]$"
      }
    }
  },
  // Ghana
  {
    "name": "Ghana",
    "code": "GH",
    "dial_code": "+233",
    "phone_length": 9,
    "regions": ["Ashanti", "Brong-Ahafo", "Central", "Eastern", "Greater Accra", "Northern", "Upper East", "Upper West", "Volta", "Western", "Western North", "Oti", "Ahafo", "Bono", "Bono East", "North East", "Savannah"],
    "documents": {
      "ID Card": {
        "label": "Ghana Card",
        "placeholder": "GHA-123456789-0",
        "regex": "^GHA-[0-9]{9}-[0-9]$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "G1234567",
        "regex": "^G[0-9]{7}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "DL-123456789",
        "regex": "^DL-[0-9]{9}$"
      }
    }
  },
  // Ivory Coast
  {
    "name": "Côte d'Ivoire",
    "code": "CI",
    "dial_code": "+225",
    "phone_length": 10,
    "regions": ["Abidjan", "Bas-Sassandra", "Comoé", "Denguélé", "Gôh-Djiboua", "Lacs", "Lagunes", "Montagnes", "Sassandra-Marahoué", "Savanes", "Vallée du Bandama", "Woroba", "Zanzan"],
    "documents": {
      "ID Card": {
        "label": "Carte Nationale d'Identité",
        "placeholder": "CI-123456789",
        "regex": "^CI-[0-9]{9}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "CIP1234567",
        "regex": "^CIP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "CI-DL-123456",
        "regex": "^CI-DL-[0-9]{6}$"
      }
    }
  },
  // Senegal
  {
    "name": "Senegal",
    "code": "SN",
    "dial_code": "+221",
    "phone_length": 9,
    "regions": ["Dakar", "Thiès", "Diourbel", "Saint-Louis", "Tambacounda", "Kaolack", "Kolda", "Ziguinchor", "Louga", "Fatick", "Matam", "Kaffrine", "Kédougou", "Sédhiou"],
    "documents": {
      "ID Card": {
        "label": "Carte Nationale d'Identité",
        "placeholder": "SN-1234567",
        "regex": "^SN-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "SNP1234567",
        "regex": "^SNP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "SN-DL-123456",
        "regex": "^SN-DL-[0-9]{6}$"
      }
    }
  },
  // Benin
  {
    "name": "Benin",
    "code": "BJ",
    "dial_code": "+229",
    "phone_length": 8,
    "regions": ["Alibori", "Atakora", "Atlantique", "Borgou", "Collines", "Couffo", "Donga", "Littoral", "Mono", "Ouémé", "Plateau", "Zou"],
    "documents": {
      "ID Card": {
        "label": "Carte d'Identité",
        "placeholder": "BJ-1234567",
        "regex": "^BJ-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "BJP1234567",
        "regex": "^BJP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "BJ-DL-123456",
        "regex": "^BJ-DL-[0-9]{6}$"
      }
    }
  },
  // Burkina Faso
  {
    "name": "Burkina Faso",
    "code": "BF",
    "dial_code": "+226",
    "phone_length": 8,
    "regions": ["Boucle du Mouhoun", "Cascades", "Centre", "Centre-Est", "Centre-Nord", "Centre-Ouest", "Centre-Sud", "Est", "Hauts-Bassins", "Nord", "Plateau-Central", "Sahel", "Sud-Ouest"],
    "documents": {
      "ID Card": {
        "label": "Carte d'Identité",
        "placeholder": "BF-1234567",
        "regex": "^BF-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "BFP1234567",
        "regex": "^BFP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "BF-DL-123456",
        "regex": "^BF-DL-[0-9]{6}$"
      }
    }
  },
  // Niger
  {
    "name": "Niger",
    "code": "NE",
    "dial_code": "+227",
    "phone_length": 8,
    "regions": ["Agadez", "Diffa", "Dosso", "Maradi", "Niamey", "Tahoua", "Tillabéri", "Zinder"],
    "documents": {
      "ID Card": {
        "label": "Carte Nationale d'Identité",
        "placeholder": "NE-1234567",
        "regex": "^NE-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "NEP1234567",
        "regex": "^NEP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "NE-DL-123456",
        "regex": "^NE-DL-[0-9]{6}$"
      }
    }
  },
  // Mali
  {
    "name": "Mali",
    "code": "ML",
    "dial_code": "+223",
    "phone_length": 8,
    "regions": ["Kayes", "Koulikoro", "Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Gao", "Kidal", "Taoudénit", "Ménaka"],
    "documents": {
      "ID Card": {
        "label": "Carte d'Identité",
        "placeholder": "ML-1234567",
        "regex": "^ML-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "MLP1234567",
        "regex": "^MLP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "ML-DL-123456",
        "regex": "^ML-DL-[0-9]{6}$"
      }
    }
  },
  // Cameroon
  {
    "name": "Cameroon",
    "code": "CM",
    "dial_code": "+237",
    "phone_length": 9,
    "regions": ["Adamawa", "Centre", "East", "Far North", "Littoral", "North", "Northwest", "South", "Southwest", "West"],
    "documents": {
      "ID Card": {
        "label": "Carte Nationale d'Identité",
        "placeholder": "CM-1234567",
        "regex": "^CM-[0-9]{7,9}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "CMP1234567",
        "regex": "^CMP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "CM-DL-123456",
        "regex": "^CM-DL-[0-9]{6}$"
      }
    }
  },
  // Kenya
  {
    "name": "Kenya",
    "code": "KE",
    "dial_code": "+254",
    "phone_length": 9,
    "regions": ["Nairobi", "Central", "Coast", "Eastern", "North Eastern", "Nyanza", "Rift Valley", "Western"],
    "documents": {
      "ID Card": {
        "label": "National ID Number",
        "placeholder": "12345678",
        "regex": "^[0-9]{8}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "A12345678",
        "regex": "^[A-Z][0-9]{8}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "DL-12345678",
        "regex": "^DL-[0-9]{8}$"
      }
    }
  },
  // Ethiopia
  {
    "name": "Ethiopia",
    "code": "ET",
    "dial_code": "+251",
    "phone_length": 9,
    "regions": ["Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela", "Harari", "Oromia", "Somali", "Southern Nations", "Tigray"],
    "documents": {
      "ID Card": {
        "label": "National ID",
        "placeholder": "ET-1234567",
        "regex": "^ET-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "ETP1234567",
        "regex": "^ETP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "ET-DL-123456",
        "regex": "^ET-DL-[0-9]{6}$"
      }
    }
  },
  // Tanzania
  {
    "name": "Tanzania",
    "code": "TZ",
    "dial_code": "+255",
    "phone_length": 9,
    "regions": ["Arusha", "Dar es Salaam", "Dodoma", "Geita", "Iringa", "Kagera", "Katavi", "Kigoma", "Kilimanjaro", "Lindi", "Manyara", "Mara", "Mbeya", "Mjini Magharibi", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North", "Pemba South", "Pwani", "Rukwa", "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Songwe", "Tabora", "Tanga", "Unguja North", "Unguja South"],
    "documents": {
      "ID Card": {
        "label": "National ID",
        "placeholder": "1234567890123456",
        "regex": "^[0-9]{16}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "TZ1234567",
        "regex": "^TZ[0-9]{7}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "TZ-DL-123456",
        "regex": "^TZ-DL-[0-9]{6}$"
      }
    }
  },
  // Uganda
  {
    "name": "Uganda",
    "code": "UG",
    "dial_code": "+256",
    "phone_length": 9,
    "regions": ["Central", "Eastern", "Northern", "Western"],
    "documents": {
      "ID Card": {
        "label": "National ID",
        "placeholder": "CM12345678ABCD",
        "regex": "^CM[0-9]{8}[A-Z]{4}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "UG1234567",
        "regex": "^UG[0-9]{7}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "UG-DL-123456",
        "regex": "^UG-DL-[0-9]{6}$"
      }
    }
  },
  // Rwanda
  {
    "name": "Rwanda",
    "code": "RW",
    "dial_code": "+250",
    "phone_length": 9,
    "regions": ["Kigali", "Eastern", "Northern", "Southern", "Western"],
    "documents": {
      "ID Card": {
        "label": "National ID",
        "placeholder": "1234567890123456",
        "regex": "^[0-9]{16}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "RWP1234567",
        "regex": "^RWP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "RW-DL-123456",
        "regex": "^RW-DL-[0-9]{6}$"
      }
    }
  },
  // Burundi
  {
    "name": "Burundi",
    "code": "BI",
    "dial_code": "+257",
    "phone_length": 8,
    "regions": ["Bubanza", "Bujumbura Mairie", "Bujumbura Rural", "Bururi", "Cankuzo", "Cibitoke", "Gitega", "Karuzi", "Kayanza", "Kirundo", "Makamba", "Muramvya", "Muyinga", "Mwaro", "Ngozi", "Rutana", "Ruyigi"],
    "documents": {
      "ID Card": {
        "label": "Carte d'Identité",
        "placeholder": "BI-1234567",
        "regex": "^BI-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "BIP1234567",
        "regex": "^BIP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "BI-DL-123456",
        "regex": "^BI-DL-[0-9]{6}$"
      }
    }
  },
  // Sierra Leone
  {
    "name": "Sierra Leone",
    "code": "SL",
    "dial_code": "+232",
    "phone_length": 8,
    "regions": ["Eastern", "Northern", "Southern", "Western Area"],
    "documents": {
      "ID Card": {
        "label": "National ID",
        "placeholder": "SL-1234567",
        "regex": "^SL-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "SLP1234567",
        "regex": "^SLP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "SL-DL-123456",
        "regex": "^SL-DL-[0-9]{6}$"
      }
    }
  },
  // Liberia
  {
    "name": "Liberia",
    "code": "LR",
    "dial_code": "+231",
    "phone_length": 7,
    "regions": ["Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount", "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland", "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe"],
    "documents": {
      "ID Card": {
        "label": "National ID",
        "placeholder": "LR-1234567",
        "regex": "^LR-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "LRP1234567",
        "regex": "^LRP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "LR-DL-123456",
        "regex": "^LR-DL-[0-9]{6}$"
      }
    }
  },
  // Guinea
  {
    "name": "Guinea",
    "code": "GN",
    "dial_code": "+224",
    "phone_length": 9,
    "regions": ["Boké", "Conakry", "Faranah", "Kankan", "Kindia", "Labé", "Mamou", "Nzérékoré"],
    "documents": {
      "ID Card": {
        "label": "Carte d'Identité",
        "placeholder": "GN-1234567",
        "regex": "^GN-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "GNP1234567",
        "regex": "^GNP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Permis de Conduire",
        "placeholder": "GN-DL-123456",
        "regex": "^GN-DL-[0-9]{6}$"
      }
    }
  },
  // Gambia
  {
    "name": "Gambia",
    "code": "GM",
    "dial_code": "+220",
    "phone_length": 7,
    "regions": ["Banjul", "Central River", "Lower River", "North Bank", "Upper River", "West Coast"],
    "documents": {
      "ID Card": {
        "label": "National ID",
        "placeholder": "GM-1234567",
        "regex": "^GM-[0-9]{7}$"
      },
      "Passport": {
        "label": "Passport Number",
        "placeholder": "GMP1234567",
        "regex": "^GMP[0-9]{7}$"
      },
      "Driver License": {
        "label": "Driver's License",
        "placeholder": "GM-DL-123456",
        "regex": "^GM-DL-[0-9]{6}$"
      }
    }
  }
];

// Combine with existing country data
const combinedCountryData = {
  countries: [...countryData.countries, ...enhancedAfricanCountries]
    // Remove duplicates by country code
    .filter((country, index, self) => 
      index === self.findIndex((c) => c.code === country.code)
    )
    // Sort alphabetically by name
    .sort((a, b) => a.name.localeCompare(b.name))
};

// Updated schemas with enhanced validation
const baseSchema = z.object({
  role: z.enum(['customer', 'farmer']),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  full_name: z.string().min(3, { message: "Full name is required" }),
  phone_number: z.string().min(1, { message: "Phone number is required" }),
  gender: z.string().min(1, { message: "Please select a gender" }),
  date_of_birth: z.string().refine(val => new Date(val).toString() !== 'Invalid Date', { message: 'Please enter a valid date' }),
  country: z.string().min(1, { message: "Country is required" }),
  region: z.string().min(1, { message: "Please select a region" }),
  city_town: z.string().min(2, { message: "City or town is required" }),
  nearest_landmark: z.string().min(3, { message: "Nearest landmark is required" }),
});

const customerSchema = z.object({
  delivery_address: z.string().min(5, { message: "Delivery address is required" }),
  preferred_delivery_method: z.string().min(1, "Please select a delivery method"),
  preferred_hub: z.string().optional(),
});

const farmerSchema = z.object({
  document_type: z.string().min(1, { message: "Document type is required" }),
  national_id: z.string().min(5, { message: "ID Number is required" }),
  farm_type: z.string().min(3, { message: "Farm type is required" }),
  farm_size: z.string().min(1, { message: "Farm size is required" }),
  farm_address: z.string().min(5, { message: "Farm address is required" }),
  main_products: z.string().min(3, { message: "Main products are required" }),
  gps_location: z.string().optional(),
  farming_experience: z.string().optional(),
});

const formSchema = z.discriminatedUnion("role", [
  baseSchema.merge(customerSchema).extend({ role: z.literal("customer") }),
  baseSchema.merge(farmerSchema).extend({ role: z.literal("farmer") })
]).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine(data => {
    if (data.role === 'customer' && data.preferred_delivery_method === 'Pickup' && !data.preferred_hub) {
        return false;
    }
    return true;
}, {
    message: "Please select a pickup hub",
    path: ["preferred_hub"],
}).superRefine((data, ctx) => {
    const countryInfo = combinedCountryData.countries.find(c => c.name === data.country);
    
    // Phone validation
    if (countryInfo) {
        // Strip non-digits to check length
        const phone = data.phone_number.replace(/\D/g, '');
        if (phone.length !== countryInfo.phone_length) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Phone number for ${data.country} must be ${countryInfo.phone_length} digits`,
                path: ['phone_number']
            });
        }
    }
    
    // ID Validation based on country + doc type
    if (data.role === 'farmer' && countryInfo && countryInfo.documents && data.document_type) {
        const docRules = countryInfo.documents[data.document_type];
        if (docRules && docRules.regex) {
            const regex = new RegExp(docRules.regex);
            if (!regex.test(data.national_id)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Invalid format. Expected: ${docRules.placeholder}`,
                    path: ['national_id']
                });
            }
        }
    }
});

const FloatingLabelInput = ({ name, label, type, register, errors, showPassword, onTogglePassword, onChange, prefix, ...props }) => {
    const { watch } = useForm();
    const value = watch(name);
    return (
        <div className="relative floating-input">
             {prefix && (
                <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center px-3 border border-r-0 border-input bg-muted/20 text-muted-foreground z-10 rounded-l-md min-w-[3.5rem] font-medium text-sm">
                    {preffix}
                </div>
            )}
            <Input
                id={name}
                type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                {...register(name, { onChange })}
                className={`h-12 ${value ? 'has-value' : ''} ${type === 'password' ? 'pr-10' : ''} ${prefix ? 'pl-[4.5rem] rounded-l-none' : ''}`}
                {...props}
            />
            <Label htmlFor={name} className={prefix ? 'left-[4.5rem]' : ''}>{label}</Label>
            {type === 'password' && (
                <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground z-10"
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            )}
            {errors[name] && <p className="text-red-500 text-xs mt-1 absolute">{errors[name].message}</p>}
        </div>
    );
};

const RegionSelector = ({ value, onSelect, error, regions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef(null);
  
  // Smooth scroll to selected region
  useEffect(() => {
    if (isOpen && scrollRef.current && value) {
      const selectedElement = scrollRef.current.querySelector(`[data-region="${value}"]`);
      if (selectedElement) {
        setTimeout(() => {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [isOpen, value]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`w-full justify-between h-12 text-base font-normal ${error ? 'border-red-500' : ''} ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
          {value || "Select a Region"} <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Region</DialogTitle>
        </DialogHeader>
        <div 
          ref={scrollRef}
          className="max-h-[60vh] overflow-y-auto scroll-smooth custom-scrollbar"
        >
          {regions && regions.length > 0 ? (
              regions.map((region) => (
                <div 
                  key={region} 
                  data-region={region}
                  onClick={() => { 
                    onSelect(region); 
                    setIsOpen(false); 
                  }} 
                  className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors duration-200"
                >
                  <span>{region}</span>
                  {value === region && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
              ))
          ) : (
              <div className="p-4 text-center text-muted-foreground">No regions available for this country.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Country Selector with search and smooth scrolling
const CountrySelector = ({ value, onSelect, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef(null);
  
  const filteredCountries = combinedCountryData.countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dial_code.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Smooth scroll to selected country
  useEffect(() => {
    if (isOpen && scrollRef.current && value) {
      const selectedElement = scrollRef.current.querySelector(`[data-country="${value}"]`);
      if (selectedElement) {
        setTimeout(() => {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [isOpen, value, searchTerm]);

  // Function to scroll to letter groups
  const scrollToLetter = (letter) => {
    if (scrollRef.current) {
      const element = scrollRef.current.querySelector(`[data-letter="${letter}"]`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  // Group countries by first letter
  const groupedCountries = filteredCountries.reduce((groups, country) => {
    const firstLetter = country.name[0].toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(country);
    return groups;
  }, {});

  // Sort letters alphabetically
  const letters = Object.keys(groupedCountries).sort();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={`w-full justify-between h-12 text-base font-normal ${error ? 'border-red-500' : ''} ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{value || "Select Country"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Country</DialogTitle>
        </DialogHeader>
        
        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search country or dial code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Letter navigation */}
        {!searchTerm && (
          <div className="flex flex-wrap gap-1 mb-4 pb-2 border-b">
            {letters.map(letter => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="px-2 py-1 text-xs font-medium rounded-md hover:bg-muted transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {/* Countries list */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar"
        >
          {searchTerm ? (
            // Display filtered list
            filteredCountries.map((country) => (
              <button
                key={country.code}
                data-country={country.name}
                onClick={() => {
                  onSelect(country.name);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors duration-200 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 flex items-center justify-center bg-muted rounded">
                    <span className="text-xs font-bold">{country.code}</span>
                  </div>
                  <div>
                    <div className="font-medium">{country.name}</div>
                    <div className="text-sm text-muted-foreground">{country.dial_code}</div>
                  </div>
                </div>
                {value === country.name && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
              </button>
            ))
          ) : (
            // Display grouped list with letters
            letters.map(letter => (
              <div key={letter} data-letter={letter}>
                <div className="sticky top-0 bg-background z-10 px-3 py-2 text-sm font-semibold text-muted-foreground border-b">
                  {letter}
                </div>
                {groupedCountries[letter].map((country) => (
                  <button
                    key={country.code}
                    data-country={country.name}
                    onClick={() => {
                      onSelect(country.name);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors duration-200 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-6 flex items-center justify-center bg-muted rounded">
                        <span className="text-xs font-bold">{country.code}</span>
                      </div>
                      <div>
                        <div className="font-medium">{country.name}</div>
                        <div className="text-sm text-muted-foreground">{country.dial_code}</div>
                      </div>
                    </div>
                    {value === country.name && <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            ))
          )}
             {filteredCountries.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No countries found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function RegisterPage() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [allowedFarmerCountries, setAllowedFarmerCountries] = useState([]);
    
    const methods = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { role: 'customer', email: '', password: '', confirmPassword: '', full_name: '', phone_number: '', gender: '', date_of_birth: '', country: '', region: '', city_town: '', nearest_landmark: '', delivery_address: '', preferred_delivery_method: '', preferred_hub: '', national_id: '', document_type: 'ID Card', farm_type: '', farm_size: '', farm_address: '', main_products: '', gps_location: '', farming_experience: '' }
    });

    const { register, handleSubmit, watch, setValue, formState: { errors } } = methods;
    const role = watch('role');
    const selectedCountry = watch('country');
    const selectedRegion = watch('region');
    const deliveryMethod = watch('preferred_delivery_method');
    const selectedHubId = watch('preferred_hub');
    const selectedDocType = watch('document_type');
    const [hubs, setHubs] = useState([]);
    const [loadingHubs, setLoadingHubs] = useState(false);

    useEffect(() => {
        const fetchAllowed = async () => {
            const { data } = await supabase.from('allowed_farmer_countries').select('country_name');
            if(data) setAllowedFarmerCountries(data.map(c => c.country_name));
        };
        fetchAllowed();
    }, []);

    useEffect(() => {
        if (role === 'farmer' && selectedCountry && allowedFarmerCountries.length > 0) {
            if (!allowedFarmerCountries.includes(selectedCountry)) {
                toast({ variant: "destructive", title: "Registration Restricted", description: `Farmer registration is currently not available in ${selectedCountry}.` });
                setValue('role', 'customer');
            }
        }
    }, [role, selectedCountry, allowedFarmerCountries, setValue, toast]);

    useEffect(() => {
        if (role === 'customer' && deliveryMethod === 'Pickup' && selectedRegion) {
            setLoadingHubs(true);
            supabase.from('pickup_hubs').select('id, name, area, address').eq('region', selectedRegion)
                .then(({ data, error }) => {
                    if (error) { toast({ variant: 'destructive', title: "Error fetching hubs", description: error.message }); setHubs([]); } 
                    else { setHubs(data); }
                    setLoadingHubs(false);
                });
        } else { setHubs([]); }
    }, [role, selectedRegion, deliveryMethod, toast]);

    // Handle ID Input Masking based on country/doc
    const handleIdInput = (e) => {
        const currentCountry = combinedCountryData.countries.find(c => c.name === selectedCountry);
        
        if (!currentCountry || !selectedDocType || !currentCountry.documents?.[selectedDocType]) {
            return;
        }

        const docRules = currentCountry.documents[selectedDocType];
        let value = e.target.value.toUpperCase();
        
        // Apply formatting based on country and document type
        switch (selectedCountry) {
            case 'Ghana':
                if (selectedDocType === 'ID Card') {
                    let clean = value.replace(/[^A-Z0-9]/g, '');
                    if (clean.length >= 3 && !clean.startsWith('GHA')) {
                        if (!value.startsWith('G')) clean = 'GHA' + clean;
                    } else if (clean.length < 3 && 'GHA'.startsWith(clean)) {
                        // let type
                    } else if (clean.length < 3) {
                        clean = 'GHA' + clean;
                    }

                    if (clean.startsWith('GHA')) {
                        let formatted = 'GHA';
                        let remaining = clean.substring(3);
                        if (remaining.length > 0) {
                            formatted += '-';
                            let digits = remaining.substring(0, 9);
                            formatted += digits;
                            if (remaining.length > 9) {
                                formatted += '-';
                                let lastDigit = remaining.substring(9, 10);
                                formatted += lastDigit;
                            }
                        }
                        value = formatted;
                    }
                }
                break;
            
            case 'Togo':
                if (selectedDocType === 'ID Card') {
                    let clean = value.replace(/[^A-Z0-9-]/g, '');
                    if (!clean.startsWith('TG-')) {
                        clean = 'TG-' + clean.replace('TG', '');
                    }
                    value = clean.replace(/(TG-)(\d{0,7})/, '$1$2');
                }
                break;
            
            case 'Nigeria':
                if (selectedDocType === 'ID Card') {
                    // NIN format: 11 digits
                    value = value.replace(/\D/g, '').substring(0, 11);
                } else if (selectedDocType === 'Passport') {
                    // Passport format: Letter + 8 digits
                    let clean = value.replace(/[^A-Z0-9]/g, '');
                    if (clean.length > 0 && !/^[A-Z]/.test(clean)) {
                        clean = 'A' + clean;
                    }
                    value = clean.substring(0, 9);
                }
                break;
            
            default:
                // Generic formatting for other countries
                if (docRules.regex) {
                    const regexParts = docRules.regex.match(/\{(.+?)\}/g);
                    if (regexParts) {
                        // Simple formatting based on expected pattern
                        value = value.replace(/[^A-Z0-9-]/g, '');
                    }
                }
                break;
        }
        
        e.target.value = value;
        setValue('national_id', value, { shouldValidate: true });
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Append country code to phone number before submitting
            const countryInfo = combinedCountryData.countries.find(c => c.name === data.country);
            let finalPhone = data.phone_number;
            
            if (countryInfo) {
                // Ensure we don't double add the code if user typed it
                const cleanPhone = finalPhone.replace(/\D/g, '');
                if (cleanPhone.length === countryInfo.phone_length) {
                    finalPhone = `${countryInfo.dial_code}${cleanPhone}`;
                } else if (!finalPhone.startsWith(countryInfo.dial_code)) {
                    finalPhone = `${countryInfo.dial_code}${cleanPhone}`;
                }
            }

            const { email, password, ...metaData } = data;
            // Update metadata with formatted phone
            const finalMetaData = { ...metaData, phone_number: finalPhone };

            const { error } = await signUp(email, password, { data: finalMetaData });
            if (error) throw error;
            toast({ title: "Registration successful!", description: "Welcome to Agribridge! You can now log in." });
            navigate('/login');
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
        } finally { setLoading(false); }
    };

    // Derived values for farmer fields
    const currentCountryInfo = combinedCountryData.countries.find(c => c.name === selectedCountry);
    const availableRegions = currentCountryInfo ? currentCountryInfo.regions : [];
    
    const docRules = currentCountryInfo?.documents?.[selectedDocType];
    const idLabel = docRules?.label || "ID Number";
    const idPlaceholder = docRules?.placeholder || "Enter ID Number";

    // Get available document types for the selected country
    const availableDocTypes = currentCountryInfo?.documents 
        ? Object.keys(currentCountryInfo.documents)
        : ['ID Card', 'Passport', 'Driver License'];

    return (
        <>
            <Helmet>
                <title>Register - Agribridge</title>
                <meta name="description" content="Create an account to start shopping for fresh farm produce." />
            </Helmet>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block mb-4">
                          <img src="https://horizons-cdn.hostinger.com/1ff2a2eb-9cef-439f-b1c4-73368cb28fdf/dee3e90e0fad3a78c5aad3fa165b27b3.jpg" alt="Agribridge Logo" className="h-24 w-24 rounded-full mx-auto shadow-md" />
                        </Link>
                         <h1 className="text-4xl font-bold tracking-tight">Create an Account</h1>
                         <p className="text-muted-foreground mt-2">Join our community of fresh produce lovers.</p>
                    </div>

                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                             <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl relative overflow-hidden max-w-sm mx-auto">
                                <motion.div className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-md" initial={false} animate={{ x: role === 'customer' ? '4px' : 'calc(100% + 4px)'}} transition={{ type: "spring", stiffness: 300, damping: 30 }}/>
                                <Button type="button" onClick={() => setValue('role', 'customer')} variant="ghost" className={`relative z-10 w-full transition-colors ${role === 'customer' ? 'text-primary' : 'text-muted-foreground'}`} noHover>
                                  <UserCheck className="mr-2 h-4 w-4" /> Customer
                                </Button>
                                <Button type="button" onClick={() => setValue('role', 'farmer')} variant="ghost" className={`relative z-10 w-full transition-colors ${role === 'farmer' ? 'text-primary' : 'text-muted-foreground'}`} noHover>
                                  <Sprout className="mr-2 h-4 w-4" /> Farmer
                                </Button>
                            </div>
                            
                            <Card>
                                <CardHeader><CardTitle className="flex items-center text-xl"><ShieldCheck className="mr-3 text-primary" /> Account Details</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                      <FloatingLabelInput name="email" label="Email Address" type="email" register={register} errors={errors} placeholder="name@example.com" />
                                      <FloatingLabelInput name="password" label="Password" type="password" register={register} errors={errors} showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} placeholder="Create a password" />
                                      <FloatingLabelInput name="confirmPassword" label="Confirm Password" type="password" register={register} errors={errors} showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} placeholder="Confirm your password" />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader><CardTitle className="flex items-center text-xl"><UserPlus className="mr-3 text-primary" /> Personal Information</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FloatingLabelInput name="full_name" label="Full Name" register={register} errors={errors} placeholder="John Doe" />
                                    
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                          <Label className="mb-2 block font-medium text-sm">Country</Label>
                                          <CountrySelector 
                                              value={selectedCountry} 
                                              onSelect={(country) => {
                                                  setValue('country', country, { shouldValidate: true });
                                                  setValue('region', '', { shouldValidate: true });
                                              }} 
                                              error={errors.country} 
                                          />
                                          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                                      </div>

                                      <FloatingLabelInput 
                                          name="phone_number" 
                                          label={`Phone Number (${currentCountryInfo ? currentCountryInfo.phone_length + ' digits' : 'Required'})`} 
                                          type="tel" 
                                          register={register} 
                                          errors={errors} 
                                          placeholder={currentCountryInfo ? `e.g., ${'0'.repeat(currentCountryInfo.phone_length)}` : '1234567890'}
                                          prefix={currentCountryInfo ? currentCountryInfo.dial_code : null}
                                      />
                                    </div>
                                    
                                    <div className="relative floating-input">
                                        <Input id="date_of_birth" type="date" {...register("date_of_birth")} className="h-12 has-value" placeholder="YYYY-MM-DD" />
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        {errors.date_of_birth && <p className="text-red-500 text-xs mt-1 absolute">{errors.date_of_birth.message}</p>}
                                    </div>
                                    <div>
                                        <Select onValueChange={(value) => setValue('gender', value, { shouldValidate: true })}>
                                            <SelectTrigger className="h-12 text-base font-normal">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
      SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle className="flex items-center text-xl"><MapPin className="mr-3 text-primary" /> Location Information</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                      <RegionSelector 
                                          value={selectedRegion} 
                                          onSelect={(region) => setValue('region', region, { shouldValidate: true })} 
                                          error={errors.region} 
                                          regions={availableRegions} 
                                      />
                                      {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region.message}</p>}
                                    </div>
                                    <FloatingLabelInput name="city_town" label="City / Town" register={register} errors={errors} placeholder="Accra" />
                                    <FloatingLabelInput name="nearest_landmark" label="Nearest Landmark" register={register} errors={errors} placeholder="Near the market" />
                                </CardContent>
                            </Card>

                            {role === 'customer' ? (
                                <AnimatePresence>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
                                        <Card>
                                            <CardHeader><CardTitle className="flex items-center text-xl"><Home className="mr-3 text-primary" /> Delivery Information</CardTitle></CardHeader>
                                            <CardContent className="space-y-6">
                                                <FloatingLabelInput name="delivery_address" label="Delivery Address" register={register} errors={errors} placeholder="House No. 123, Street Name" />
                                                <div>
                                                    <Label className="font-semibold text-sm text-foreground relative">Preferred Delivery Method</Label>
                                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                                        <button type="button" onClick={() => setValue('preferred_delivery_method', 'Delivery', { shouldValidate: true })} className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${deliveryMethod === 'Delivery' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                            <Truck className="w-8 h-8 mb-2 text-primary"/>
                                                            <span className="font-medium text-sm">Home Delivery</span>
                                                        </button>
                                                        <button type="button" onClick={() => setValue('preferred_delivery_method', 'Pickup', { shouldValidate: true })} className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${deliveryMethod === 'Pickup' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                                            <Warehouse className="w-8 h-8 mb-2 text-primary"/>
                                                            <span className="font-medium text-sm">Pickup Hub</span>
                                                        </button>
                                                          </div>
                                                    {errors.preferred_delivery_method && <p className="text-red-500 text-xs mt-1">{errors.preferred_delivery_method.message}</p>}
                                                </div>
                                                <AnimatePresence mode="wait">
                                                    {deliveryMethod === 'Delivery' && (
                                                        <motion.div key="delivery-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-blue-50 text-blue-800 border-l-4 border-blue-400 rounded-r-lg flex items-start gap-3 text-sm">
                                                            <Info className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                                                            <span>Home delivery may incur additional charges.</span>
                                                        </motion.div>
                                                    )}
                                                    {deliveryMethod === 'Pickup' && (
                                                        <motion.div key="pickup-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                                            {loadingHubs && (
                                                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                                                    <span>Loading hubs...</span>
                                                                </div>
                                                            )}
                                                            {!loadingHubs && hubs.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <Label className="font-semibold text-sm text-foreground relative">Select a Pickup Hub</Label>
                                                                    <div className="grid gap-2 max-h-48 overflow-y-auto pr-2 pt-2 scroll-smooth">
                                                                        {hubs.map(hub => (
                                                                            <button 
                                                                                key={hub.id} 
                                                                                type="button" 
                                                                                onClick={() => setValue('preferred_hub', hub.id, { shouldValidate: true })} 
                                                                                className={`text-left p-3 border-2 rounded-lg transition-all ${selectedHubId === hub.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                                                            >
                                                                                <p className="font-medium">{hub.name}</p>
                                                                                <p className="text-sm text-muted-foreground">{hub.area} - {hub.address}</p>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                    {errors.preferred_hub && <p className="text-red-500 text-xs mt-1">{errors.preferred_hub.message}</p>}
                                                                </div>
                                                            )}
                                                            {!loadingHubs && hubs.length === 0 && (
                                                                <div className="p-3 bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 rounded-r-lg flex items-start gap-3 text-sm">
                                                                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                                                                    <span>No pickup hubs in {selectedRegion}. Please select Home Delivery.</span>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                <AnimatePresence>
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-xl">
                                                    <Sprout className="mr-3 text-primary" /> Farm Information
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="md:col-span-2">
                                                        <Label className="mb-2 block font-semibold text-sm">Document Type</Label>
                                                        <Select 
                                                            onValueChange={(val) => { 
                                                                setValue('document_type', val, { shouldValidate: true }); 
                                                                setValue('national_id', ''); 
                                                            }} 
                                                            defaultValue="ID Card"
                                                        >
                                                            <SelectTrigger className="h-12">
                                                                <SelectValue placeholder="Select Document Type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="max-h-[300px] scroll-smooth">
                                                                {availableDocTypes.map((docType) => (
                                                                    <SelectItem key={docType} value={docType}>
                                                                        {docType}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {currentCountryInfo?.documents?.[selectedDocType] && (
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                Expected format: {docRules?.placeholder}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <FloatingLabelInput 
                                                            name="national_id" 
                                                            label={idLabel} 
                                                            register={register} 
                                                            errors={errors} 
                                                            onChange={handleIdInput}
                                                            placeholder={idPlaceholder}
                                                        />
                                                        {docRules && (
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                Example: {docRules.placeholder}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <FloatingLabelInput name="farm_type" label="Type of Farm" register={register} errors={errors} placeholder="Poultry, Vegetable, etc." />
                                                <FloatingLabelInput name="farm_size" label="Farm Size (in Acres)" register={register} errors={errors} placeholder="e.g. 5 acres" />
                                                <FloatingLabelInput name="farm_address" label="Farm Address" register={register} errors={errors} placeholder="Plot 45, Village Name" />
                                                <FloatingLabelInput name="main_products" label="Main Products" register={register} errors={errors} placeholder="Maize, Cassava, etc." />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </AnimatePresence>
                            )}

                            <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Create Account'}
                            </Button>
                        </form>
                    </FormProvider>
                    <p className="text-center text-sm text-gray-600 mt-8">
                        Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </>
    );
}