import React, { useState } from 'react';
import { Smartphone, Tablet, Code, Play, Download, Eye, Settings } from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { generateMobileApp } from '../services/mobileService';

interface MobileFramework {
  id: string;
  name: string;
  description: string;
  icon: string;
  platforms: string[];
  language: string;
}

interface MobileTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  category: string;
  features: string[];
  code: string;
}

const MOBILE_FRAMEWORKS: MobileFramework[] = [
  {
    id: 'react-native',
    name: 'React Native',
    description: 'Build native mobile apps using React',
    icon: '⚛️',
    platforms: ['iOS', 'Android'],
    language: 'JavaScript/TypeScript'
  },
  {
    id: 'flutter',
    name: 'Flutter',
    description: 'Google\'s UI toolkit for mobile, web, and desktop',
    icon: '🐦',
    platforms: ['iOS', 'Android', 'Web', 'Desktop'],
    language: 'Dart'
  },
  {
    id: 'ionic',
    name: 'Ionic',
    description: 'Hybrid mobile apps with web technologies',
    icon: '⚡',
    platforms: ['iOS', 'Android', 'Web'],
    language: 'JavaScript/TypeScript'
  },
  {
    id: 'xamarin',
    name: 'Xamarin',
    description: 'Microsoft\'s cross-platform mobile development',
    icon: '🔷',
    platforms: ['iOS', 'Android'],
    language: 'C#'
  }
];

const MOBILE_TEMPLATES: MobileTemplate[] = [
  {
    id: 'todo-app',
    name: 'Todo List App',
    description: 'Simple task management application',
    framework: 'react-native',
    category: 'Productivity',
    features: ['Add/Remove Tasks', 'Mark Complete', 'Local Storage'],
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');

  const addTask = () => {
    if (inputText.trim()) {
      setTasks([...tasks, { id: Date.now(), text: inputText, completed: false }]);
      setInputText('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add a new task..."
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
              <Text style={[styles.taskText, item.completed && styles.completedTask]}>
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 10,
  },
  taskText: {
    fontSize: 16,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    color: 'red',
    fontWeight: 'bold',
  },
});`
  },
  {
    id: 'weather-app',
    name: 'Weather App',
    description: 'Current weather and forecast display',
    framework: 'flutter',
    category: 'Utility',
    features: ['Current Weather', 'Location Services', 'API Integration'],
    code: `import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(WeatherApp());
}

class WeatherApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Weather App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: WeatherScreen(),
    );
  }
}

class WeatherScreen extends StatefulWidget {
  @override
  _WeatherScreenState createState() => _WeatherScreenState();
}

class _WeatherScreenState extends State<WeatherScreen> {
  String temperature = '--';
  String description = 'Loading...';
  String cityName = 'Your City';
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchWeather();
  }

  Future<void> fetchWeather() async {
    try {
      // Replace with your API key and endpoint
      final response = await http.get(
        Uri.parse('https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY&units=metric'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          temperature = '\${data['main']['temp'].round()}°C';
          description = data['weather'][0]['description'];
          cityName = data['name'];
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        description = 'Error loading weather';
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Weather App'),
        backgroundColor: Colors.blue,
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.blue[400]!, Colors.blue[800]!],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                cityName,
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 20),
              Text(
                temperature,
                style: TextStyle(
                  fontSize: 72,
                  fontWeight: FontWeight.w300,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 10),
              Text(
                description,
                style: TextStyle(
                  fontSize: 20,
                  color: Colors.white70,
                ),
              ),
              SizedBox(height: 40),
              ElevatedButton(
                onPressed: isLoading ? null : fetchWeather,
                child: Text('Refresh'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.blue,
                  padding: EdgeInsets.symmetric(horizontal: 30, vertical: 15),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`
  }
];

export function MobileDevelopment() {
  const { state, dispatch } = useAgent();
  const [selectedFramework, setSelectedFramework] = useState<MobileFramework>(MOBILE_FRAMEWORKS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<MobileTemplate | null>(null);
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'phone' | 'tablet'>('phone');

  const handleGenerateApp = async () => {
    if (!state.apiKey || !appName.trim()) return;

    setIsGenerating(true);
    try {
      const appCode = await generateMobileApp(
        appName,
        appDescription,
        selectedFramework.id,
        state.apiKey,
        state.provider
      );

      const newFile = {
        id: Date.now().toString(),
        name: `${appName.toLowerCase().replace(/\s+/g, '-')}.${selectedFramework.language.includes('Dart') ? 'dart' : 'js'}`,
        path: `mobile/${appName.toLowerCase().replace(/\s+/g, '-')}.${selectedFramework.language.includes('Dart') ? 'dart' : 'js'}`,
        content: appCode,
        language: selectedFramework.language.includes('Dart') ? 'dart' : 'javascript',
        size: appCode.length,
        lastModified: new Date()
      };

      dispatch({ type: 'ADD_PROJECT_FILE', payload: newFile });
      dispatch({ type: 'SET_ACTIVE_FILE', payload: newFile.id });
    } catch (error) {
      console.error('Failed to generate mobile app:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseTemplate = (template: MobileTemplate) => {
    const newFile = {
      id: Date.now().toString(),
      name: `${template.name.toLowerCase().replace(/\s+/g, '-')}.${template.framework === 'flutter' ? 'dart' : 'js'}`,
      path: `mobile/${template.name.toLowerCase().replace(/\s+/g, '-')}.${template.framework === 'flutter' ? 'dart' : 'js'}`,
      content: template.code,
      language: template.framework === 'flutter' ? 'dart' : 'javascript',
      size: template.code.length,
      lastModified: new Date()
    };

    dispatch({ type: 'ADD_PROJECT_FILE', payload: newFile });
    dispatch({ type: 'SET_ACTIVE_FILE', payload: newFile.id });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Smartphone className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Mobile Development</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPreviewMode('phone')}
            className={`p-2 rounded-lg ${previewMode === 'phone' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`p-2 rounded-lg ${previewMode === 'tablet' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Tablet className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Framework Selection */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Framework</h3>
          
          <div className="space-y-3">
            {MOBILE_FRAMEWORKS.map((framework) => (
              <div
                key={framework.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                  selectedFramework.id === framework.id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedFramework(framework)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{framework.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{framework.name}</h4>
                    <p className="text-sm text-gray-600">{framework.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {framework.platforms.map((platform) => (
                        <span key={platform} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* App Generator */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Generate New App</h4>
            
            <div className="space-y-3">
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="App name"
                className="input-field"
              />
              
              <textarea
                value={appDescription}
                onChange={(e) => setAppDescription(e.target.value)}
                placeholder="Describe your app features..."
                className="input-field resize-none"
                rows={3}
              />
              
              <button
                onClick={handleGenerateApp}
                disabled={isGenerating || !state.apiKey || !appName.trim()}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Code className="h-4 w-4" />
                <span>{isGenerating ? 'Generating...' : 'Generate App'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">App Templates</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {MOBILE_TEMPLATES.filter(t => t.framework === selectedFramework.id).map((template) => (
              <div
                key={template.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                  selectedTemplate?.id === template.id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {template.category}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Use Template
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.features.map((feature, index) => (
                    <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600 capitalize">{previewMode}</span>
            </div>
          </div>
          
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className={`mx-auto bg-gray-900 rounded-lg overflow-hidden ${
                previewMode === 'phone' ? 'w-64 h-96' : 'w-80 h-64'
              }`}>
                <div className="bg-gray-800 p-2 text-center">
                  <div className="w-16 h-1 bg-gray-600 rounded-full mx-auto"></div>
                </div>
                
                <div className="p-4 h-full bg-white text-gray-900 overflow-y-auto">
                  <div className="text-center">
                    <h4 className="font-bold text-lg mb-2">{selectedTemplate.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>
                    
                    {/* Mock UI Elements */}
                    <div className="space-y-3">
                      <div className="h-8 bg-gray-100 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                      <div className="h-10 bg-primary-600 text-white rounded flex items-center justify-center">
                        Action Button
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Framework: {selectedFramework.name}</p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Use Template</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Select a template to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}