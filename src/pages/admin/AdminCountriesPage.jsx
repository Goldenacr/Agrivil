
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Globe, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import countryData from '@/lib/countryData.json';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const AdminCountriesPage = () => {
    const { toast } = useToast();
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('');

    const fetchAllowedCountries = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('allowed_farmer_countries').select('*');
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } else {
            setCountries(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllowedCountries();
    }, []);

    const handleAddCountry = async () => {
        if (!selectedCountry) return;
        
        const { error } = await supabase
            .from('allowed_farmer_countries')
            .insert({ country_name: selectedCountry });

        if (error) {
            if (error.code === '23505') { // Unique violation
                toast({ variant: 'destructive', title: 'Duplicate', description: 'Country is already on the list.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            }
        } else {
            toast({ title: 'Success', description: `${selectedCountry} added to allowed list.` });
            setSelectedCountry('');
            fetchAllowedCountries();
        }
    };

    const handleDeleteCountry = async (name) => {
        const { error } = await supabase
            .from('allowed_farmer_countries')
            .delete()
            .eq('country_name', name);

        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } else {
            toast({ title: 'Removed', description: `${name} removed from allowed list.` });
            fetchAllowedCountries();
        }
    };

    const availableCountries = countryData.countries
        .filter(c => !countries.some(existing => existing.country_name === c.name))
        .sort((a,b) => a.name.localeCompare(b.name));

    return (
        <>
            <Helmet><title>Allowed Farmer Countries - Admin</title></Helmet>
            <div className="space-y-6 py-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Allowed Farmer Countries</h1>
                    <p className="text-muted-foreground">Manage which countries are permitted for farmer registration.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Allowed Country</CardTitle>
                            <CardDescription>Select a country to allow farmers to register from.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4">
                            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select country..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCountries.map(c => (
                                        <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAddCountry} disabled={!selectedCountry}>
                                <Plus className="w-4 h-4 mr-2" /> Add
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Current List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Country Name</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>
                                    ) : countries.length === 0 ? (
                                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No countries set.</TableCell></TableRow>
                                    ) : (
                                        countries.map((country) => (
                                            <TableRow key={country.country_name}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-blue-500"/> {country.country_name}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteCountry(country.country_name)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default AdminCountriesPage;
