'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useBabyProfile } from '@/app/BabyProfileContext';

interface Photo {
  id: string;
  name: string;
  description: string;
  date: string;
  tags: string[];
  albums: string[];
  dataUrl: string;
  babyId: string; // Add babyId to associate photos with specific babies
}

interface Album {
  id: string;
  name: string;
  description: string;
  coverPhotoId: string | null;
  babyId: string; // Add babyId to associate albums with specific babies
}

export default function PhotoLogPage() {
  const { activeProfileData } = useBabyProfile();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');
  const [photoDate, setPhotoDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [photoTags, setPhotoTags] = useState('');
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showAlbumDialog, setShowAlbumDialog] = useState(false);
  const [showViewPhotoDialog, setShowViewPhotoDialog] = useState(false);
  const [filterTag, setFilterTag] = useState('all');
  const [filterAlbum, setFilterAlbum] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  // Load data from localStorage
  useEffect(() => {
    const savedPhotos = localStorage.getItem('photoLogs');
    const savedAlbums = localStorage.getItem('photoAlbums');
    if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
    if (savedAlbums) setAlbums(JSON.parse(savedAlbums));
  }, []);

  // Save data to localStorage whenever photos or albums change
  useEffect(() => {
    localStorage.setItem('photoLogs', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('photoAlbums', JSON.stringify(albums));
  }, [albums]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeProfileData) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const newPhoto: Photo = {
          id: Date.now().toString(),
          name: file.name,
          description: '',
          date: photoDate,
          tags: [],
          albums: [],
          dataUrl: event.target.result,
          babyId: activeProfileData.id
        };

        setPhotoName(file.name);
        setSelectedPhoto(newPhoto);
        setShowPhotoDialog(true);
      }
    };

    reader.readAsDataURL(file);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const handleSavePhoto = () => {
    if (!selectedPhoto || !activeProfileData) return;

    const tagsArray = photoTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const updatedPhoto: Photo = {
      ...selectedPhoto,
      name: photoName,
      description: photoDescription,
      date: photoDate,
      tags: tagsArray,
      albums: selectedAlbums,
      babyId: activeProfileData.id
    };

    // Check if we're editing an existing photo or adding a new one
    const existingPhotoIndex = photos.findIndex(p => p.id === updatedPhoto.id);
    
    if (existingPhotoIndex >= 0) {
      // Update existing photo
      const updatedPhotos = [...photos];
      updatedPhotos[existingPhotoIndex] = updatedPhoto;
      setPhotos(updatedPhotos);
    } else {
      // Add new photo
      setPhotos([...photos, updatedPhoto]);
    }

    resetPhotoForm();
    setShowPhotoDialog(false);
  };

  const handleEditPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setPhotoName(photo.name);
    setPhotoDescription(photo.description);
    setPhotoDate(photo.date);
    setPhotoTags(photo.tags.join(', '));
    setSelectedAlbums(photo.albums);
    setShowPhotoDialog(true);
  };

  const handleViewPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowViewPhotoDialog(true);
  };

  const handleDeletePhoto = (id: string) => {
    // Remove photo from all albums
    const updatedAlbums = albums.map(album => {
      if (album.coverPhotoId === id) {
        return { ...album, coverPhotoId: null };
      }
      return album;
    });
    
    setAlbums(updatedAlbums);
    setPhotos(photos.filter(photo => photo.id !== id));
  };

  const resetPhotoForm = () => {
    setSelectedPhoto(null);
    setPhotoName('');
    setPhotoDescription('');
    setPhotoDate(format(new Date(), 'yyyy-MM-dd'));
    setPhotoTags('');
    setSelectedAlbums([]);
  };

  const handleSaveAlbum = () => {
    if (!albumName || !activeProfileData) return;

    if (selectedAlbumId) {
      // Update existing album
      const updatedAlbums = albums.map(album => 
        album.id === selectedAlbumId 
          ? { ...album, name: albumName, description: albumDescription }
          : album
      );
      setAlbums(updatedAlbums);
    } else {
      // Create new album
      const newAlbum: Album = {
        id: Date.now().toString(),
        name: albumName,
        description: albumDescription,
        coverPhotoId: null,
        babyId: activeProfileData.id
      };
      setAlbums([...albums, newAlbum]);
    }

    resetAlbumForm();
    setShowAlbumDialog(false);
  };

  const handleEditAlbum = (album: Album) => {
    setSelectedAlbumId(album.id);
    setAlbumName(album.name);
    setAlbumDescription(album.description);
    setShowAlbumDialog(true);
  };

  const handleDeleteAlbum = (id: string) => {
    // Remove album from all photos
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      albums: photo.albums.filter(albumId => albumId !== id)
    }));
    
    setPhotos(updatedPhotos);
    setAlbums(albums.filter(album => album.id !== id));
  };

  const resetAlbumForm = () => {
    setSelectedAlbumId(null);
    setAlbumName('');
    setAlbumDescription('');
  };

  const handleSetAlbumCover = (albumId: string, photoId: string) => {
    const updatedAlbums = albums.map(album => 
      album.id === albumId 
        ? { ...album, coverPhotoId: photoId }
        : album
    );
    setAlbums(updatedAlbums);
  };

  const handleTogglePhotoInAlbum = (photoId: string, albumId: string) => {
    const updatedPhotos = photos.map(photo => {
      if (photo.id === photoId) {
        const isInAlbum = photo.albums.includes(albumId);
        const updatedAlbums = isInAlbum
          ? photo.albums.filter(id => id !== albumId)
          : [...photo.albums, albumId];
        
        return { ...photo, albums: updatedAlbums };
      }
      return photo;
    });
    
    setPhotos(updatedPhotos);
  };

  // Filter photos and albums for the active baby
  const getFilteredPhotos = () => {
    let filtered = activeProfileData 
      ? photos.filter(photo => photo.babyId === activeProfileData.id)
      : [];
    
    // Apply tag filter
    if (filterTag && filterTag !== 'all') {
      filtered = filtered.filter(photo => 
        photo.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
      );
    }
    
    // Apply album filter
    if (filterAlbum && filterAlbum !== 'all') {
      filtered = filtered.filter(photo => 
        photo.albums.includes(filterAlbum)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };

  const getFilteredAlbums = () => {
    return activeProfileData 
      ? albums.filter(album => album.babyId === activeProfileData.id)
      : [];
  };

  const getAlbumPhotos = (albumId: string) => {
    return photos.filter(photo => 
      photo.albums.includes(albumId) && 
      photo.babyId === activeProfileData?.id
    );
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    const filteredPhotos = activeProfileData 
      ? photos.filter(photo => photo.babyId === activeProfileData.id)
      : [];
      
    filteredPhotos.forEach(photo => {
      photo.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const getAlbumCoverPhoto = (albumId: string) => {
    const album = albums.find(a => a.id === albumId);
    if (album && album.coverPhotoId) {
      return photos.find(p => p.id === album.coverPhotoId);
    }
    
    // If no cover photo is set, use the first photo in the album
    const albumPhotos = getAlbumPhotos(albumId);
    return albumPhotos.length > 0 ? albumPhotos[0] : null;
  };

  const filteredPhotos = getFilteredPhotos();
  const filteredAlbums = getFilteredAlbums();
  const allTags = getAllTags();

  // If no active profile, show a message
  if (!activeProfileData) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Photo Log</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4">
              Please set up a baby profile in the settings page first.
            </p>
            <Button 
              className="w-full mt-4"
              onClick={() => window.location.href = '/settings'}
            >
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4">
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <CardTitle className="text-2xl">Photo Log for {activeProfileData.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="photos" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="albums">Albums</TabsTrigger>
            </TabsList>
            
            <TabsContent value="photos" className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="upload">Upload Photo</Label>
                  <Input 
                    id="upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="mt-1"
                  />
                </div>
                
                <div className="flex flex-col md:flex-row gap-2">
                  <div>
                    <Label htmlFor="filterTag">Filter by Tag</Label>
                    <Select value={filterTag} onValueChange={setFilterTag}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Tags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        {allTags.map(tag => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filterAlbum">Filter by Album</Label>
                    <Select value={filterAlbum} onValueChange={setFilterAlbum}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Albums" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Albums</SelectItem>
                        {filteredAlbums.map(album => (
                          <SelectItem key={album.id} value={album.id}>{album.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="sortOrder">Sort By</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredPhotos.map(photo => (
                    <Card key={photo.id} className="overflow-hidden">
                      <div 
                        className="h-48 bg-cover bg-center cursor-pointer"
                        style={{ backgroundImage: `url(${photo.dataUrl})` }}
                        onClick={() => handleViewPhoto(photo)}
                      ></div>
                      <CardContent className="p-3">
                        <h3 className="font-medium truncate">{photo.name}</h3>
                        <p className="text-sm text-muted-foreground">{photo.date}</p>
                        {photo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {photo.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {photo.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{photo.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-2 pt-0 flex justify-between">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditPhoto(photo)}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this photo? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePhoto(photo.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {photos.some(photo => photo.babyId === activeProfileData.id) 
                      ? "No photos match your current filters." 
                      : "No photos uploaded yet for this baby. Upload your first photo to get started!"}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="albums" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Photo Albums for {activeProfileData.name}</h3>
                <Button onClick={() => {
                  resetAlbumForm();
                  setShowAlbumDialog(true);
                }}>
                  Create Album
                </Button>
              </div>
              
              {filteredAlbums.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredAlbums.map(album => {
                    const coverPhoto = getAlbumCoverPhoto(album.id);
                    const photoCount = getAlbumPhotos(album.id).length;
                    
                    return (
                      <Card key={album.id} className="overflow-hidden">
                        <div 
                          className="h-48 bg-cover bg-center cursor-pointer bg-gray-100 flex items-center justify-center"
                          style={coverPhoto ? { backgroundImage: `url(${coverPhoto.dataUrl})` } : {}}
                          onClick={() => {
                            setSelectedAlbumId(album.id);
                            setFilterAlbum(album.id);
                            setActiveTab('photos');
                          }}
                        >
                          {!coverPhoto && (
                            <p className="text-muted-foreground">No photos in album</p>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium">{album.name}</h3>
                          <p className="text-sm text-muted-foreground">{photoCount} photos</p>
                          {album.description && (
                            <p className="text-sm mt-2 line-clamp-2">{album.description}</p>
                          )}
                        </CardContent>
                        <CardFooter className="p-2 pt-0 flex justify-between">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditAlbum(album)}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this album? The photos will not be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteAlbum(album.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No albums created yet for {activeProfileData.name}. Create your first album to organize your photos!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Photo Upload/Edit Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPhoto && photos.some(p => p.id === selectedPhoto.id) ? 'Edit Photo' : 'Add Photo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedPhoto && (
              <div className="flex justify-center">
                <img 
                  src={selectedPhoto.dataUrl} 
                  alt="Preview" 
                  className="max-h-48 object-contain"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="photoName">Photo Name</Label>
              <Input 
                id="photoName" 
                value={photoName} 
                onChange={(e) => setPhotoName(e.target.value)} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photoDate">Date Taken</Label>
              <Input 
                id="photoDate" 
                type="date" 
                value={photoDate} 
                onChange={(e) => setPhotoDate(e.target.value)} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photoDescription">Description (Optional)</Label>
              <Textarea 
                id="photoDescription" 
                value={photoDescription} 
                onChange={(e) => setPhotoDescription(e.target.value)} 
                placeholder="Add a description..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photoTags">Tags (Comma Separated)</Label>
              <Input 
                id="photoTags" 
                value={photoTags} 
                onChange={(e) => setPhotoTags(e.target.value)} 
                placeholder="e.g., baby, milestone, family"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Albums</Label>
              <div className="grid grid-cols-2 gap-2">
                {filteredAlbums.map(album => (
                  <div key={album.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={`album-${album.id}`} 
                      checked={selectedAlbums.includes(album.id)}
                      onChange={() => {
                        if (selectedAlbums.includes(album.id)) {
                          setSelectedAlbums(selectedAlbums.filter(id => id !== album.id));
                        } else {
                          setSelectedAlbums([...selectedAlbums, album.id]);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={`album-${album.id}`}>{album.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSavePhoto}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Album Create/Edit Dialog */}
      <Dialog open={showAlbumDialog} onOpenChange={setShowAlbumDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedAlbumId ? 'Edit Album' : 'Create Album'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="albumName">Album Name</Label>
              <Input 
                id="albumName" 
                value={albumName} 
                onChange={(e) => setAlbumName(e.target.value)} 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="albumDescription">Description (Optional)</Label>
              <Textarea 
                id="albumDescription" 
                value={albumDescription} 
                onChange={(e) => setAlbumDescription(e.target.value)} 
                placeholder="Add a description..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveAlbum}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo View Dialog */}
      <Dialog open={showViewPhotoDialog} onOpenChange={setShowViewPhotoDialog}>
        <DialogContent className="max-w-3xl">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPhoto.name}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="flex justify-center mb-4">
                  <img 
                    src={selectedPhoto.dataUrl} 
                    alt={selectedPhoto.name} 
                    className="max-h-[60vh] object-contain"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Date</h4>
                    <p>{selectedPhoto.date}</p>
                  </div>
                  
                  {selectedPhoto.description && (
                    <div>
                      <h4 className="font-medium">Description</h4>
                      <p>{selectedPhoto.description}</p>
                    </div>
                  )}
                  
                  {selectedPhoto.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium">Tags</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPhoto.tags.map(tag => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedPhoto.albums.length > 0 && (
                    <div>
                      <h4 className="font-medium">Albums</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPhoto.albums.map(albumId => {
                          const album = filteredAlbums.find(a => a.id === albumId);
                          return album ? (
                            <div key={albumId} className="flex items-center gap-1">
                              <Badge variant="secondary">
                                {album.name}
                              </Badge>
                              {album.coverPhotoId === selectedPhoto.id ? (
                                <Badge variant="outline" className="text-xs">Cover</Badge>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 px-2 text-xs"
                                  onClick={() => handleSetAlbumCover(albumId, selectedPhoto.id)}
                                >
                                  Set as Cover
                                </Button>
                              )}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {filteredAlbums.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Add to Album</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {filteredAlbums.map(album => (
                        <Button 
                          key={album.id} 
                          variant={selectedPhoto.albums.includes(album.id) ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleTogglePhotoInAlbum(selectedPhoto.id, album.id)}
                        >
                          {selectedPhoto.albums.includes(album.id) ? "✓ " : ""}{album.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => handleEditPhoto(selectedPhoto)}
                >
                  Edit
                </Button>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}