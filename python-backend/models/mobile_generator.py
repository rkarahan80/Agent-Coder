import asyncio
from typing import Dict, Any, Optional
from dataclasses import dataclass
import json

@dataclass
class MobileFramework:
    id: str
    name: str
    language: str
    file_extension: str
    template_structure: Dict[str, Any]

class MobileGenerator:
    def __init__(self):
        self.frameworks = {
            "react-native": MobileFramework(
                id="react-native",
                name="React Native",
                language="javascript",
                file_extension="js",
                template_structure={
                    "main_file": "App.js",
                    "dependencies": ["react", "react-native"],
                    "build_command": "npx react-native run-android"
                }
            ),
            "flutter": MobileFramework(
                id="flutter",
                name="Flutter",
                language="dart",
                file_extension="dart",
                template_structure={
                    "main_file": "lib/main.dart",
                    "dependencies": ["flutter"],
                    "build_command": "flutter build apk"
                }
            ),
            "ionic": MobileFramework(
                id="ionic",
                name="Ionic",
                language="typescript",
                file_extension="ts",
                template_structure={
                    "main_file": "src/app/app.component.ts",
                    "dependencies": ["@ionic/angular"],
                    "build_command": "ionic build"
                }
            )
        }
    
    async def generate_app(
        self,
        app_name: str,
        description: str,
        framework: str,
        api_key: str,
        provider: str = "openai"
    ) -> str:
        """Generate a mobile application"""
        if framework not in self.frameworks:
            raise ValueError(f"Unsupported framework: {framework}")
        
        framework_info = self.frameworks[framework]
        
        # Generate app based on framework
        if framework == "react-native":
            return await self._generate_react_native_app(app_name, description)
        elif framework == "flutter":
            return await self._generate_flutter_app(app_name, description)
        elif framework == "ionic":
            return await self._generate_ionic_app(app_name, description)
        else:
            return await self._generate_generic_app(app_name, description, framework_info)
    
    async def _generate_react_native_app(self, app_name: str, description: str) -> str:
        """Generate React Native application"""
        template = f'''import React, {{ useState, useEffect }} from 'react';
import {{
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView
}} from 'react-native';

const {app_name.replace(" ", "")}App = () => {{
  const [data, setData] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {{
    // Initialize app
    initializeApp();
  }}, []);

  const initializeApp = async () => {{
    try {{
      setLoading(true);
      // Add initialization logic here
      console.log('{app_name} initialized successfully');
    }} catch (error) {{
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize app');
    }} finally {{
      setLoading(false);
    }}
  }};

  const handleAction = () => {{
    if (inputText.trim()) {{
      setData([...data, {{
        id: Date.now(),
        text: inputText,
        timestamp: new Date().toISOString()
      }}]);
      setInputText('');
    }}
  }};

  const handleItemPress = (item) => {{
    Alert.alert('Item Selected', `You selected: ${{item.text}}`);
  }};

  return (
    <SafeAreaView style={{styles.container}}>
      <View style={{styles.header}}>
        <Text style={{styles.title}}>{app_name}</Text>
        <Text style={{styles.subtitle}}>{description}</Text>
      </View>

      <View style={{styles.inputContainer}}>
        <TextInput
          style={{styles.input}}
          value={{inputText}}
          onChangeText={{setInputText}}
          placeholder="Enter text here..."
          multiline={{false}}
        />
        <TouchableOpacity 
          style={{styles.button}} 
          onPress={{handleAction}}
          disabled={{loading}}
        >
          <Text style={{styles.buttonText}}>
            {{loading ? 'Loading...' : 'Add Item'}}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{styles.listContainer}}>
        {{data.map((item) => (
          <TouchableOpacity
            key={{item.id}}
            style={{styles.listItem}}
            onPress={{() => handleItemPress(item)}}
          >
            <Text style={{styles.itemText}}>{{item.text}}</Text>
            <Text style={{styles.itemTimestamp}}>
              {{new Date(item.timestamp).toLocaleTimeString()}}
            </Text>
          </TouchableOpacity>
        ))}}
        
        {{data.length === 0 && !loading && (
          <View style={{styles.emptyState}}>
            <Text style={{styles.emptyText}}>No items yet. Add one above!</Text>
          </View>
        )}}
      </ScrollView>
    </SafeAreaView>
  );
}};

const styles = StyleSheet.create({{
  container: {{
    flex: 1,
    backgroundColor: '#f5f5f5',
  }},
  header: {{
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  }},
  title: {{
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  }},
  subtitle: {{
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  }},
  inputContainer: {{
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  }},
  input: {{
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
  }},
  button: {{
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  }},
  buttonText: {{
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }},
  listContainer: {{
    flex: 1,
    padding: 15,
  }},
  listItem: {{
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {{
      width: 0,
      height: 1,
    }},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  }},
  itemText: {{
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  }},
  itemTimestamp: {{
    fontSize: 12,
    color: '#666',
  }},
  emptyState: {{
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  }},
  emptyText: {{
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  }},
}});

export default {app_name.replace(" ", "")}App;'''
        
        return template
    
    async def _generate_flutter_app(self, app_name: str, description: str) -> str:
        """Generate Flutter application"""
        template = f'''import 'package:flutter/material.dart';

void main() {{
  runApp({app_name.replace(" ", "")}App());
}}

class {app_name.replace(" ", "")}App extends StatelessWidget {{
  @override
  Widget build(BuildContext context) {{
    return MaterialApp(
      title: '{app_name}',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: HomeScreen(),
    );
  }}
}}

class HomeScreen extends StatefulWidget {{
  @override
  _HomeScreenState createState() => _HomeScreenState();
}}

class _HomeScreenState extends State<HomeScreen> {{
  final TextEditingController _controller = TextEditingController();
  List<Map<String, dynamic>> _items = [];
  bool _isLoading = false;

  @override
  void initState() {{
    super.initState();
    _initializeApp();
  }}

  void _initializeApp() async {{
    setState(() {{
      _isLoading = true;
    }});
    
    // Simulate initialization
    await Future.delayed(Duration(seconds: 1));
    
    setState(() {{
      _isLoading = false;
    }});
  }}

  void _addItem() {{
    if (_controller.text.trim().isNotEmpty) {{
      setState(() {{
        _items.add({{
          'id': DateTime.now().millisecondsSinceEpoch,
          'text': _controller.text,
          'timestamp': DateTime.now(),
        }});
      }});
      _controller.clear();
    }}
  }}

  void _handleItemTap(Map<String, dynamic> item) {{
    showDialog(
      context: context,
      builder: (BuildContext context) {{
        return AlertDialog(
          title: Text('Item Selected'),
          content: Text('You selected: ${{item['text']}}'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('OK'),
            ),
          ],
        );
      }},
    );
  }}

  @override
  Widget build(BuildContext context) {{
    return Scaffold(
      appBar: AppBar(
        title: Text('{app_name}'),
        backgroundColor: Colors.blue,
        elevation: 0,
      ),
      body: Column(
        children: [
          Container(
            color: Colors.blue,
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                Text(
                  '{description}',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        decoration: InputDecoration(
                          hintText: 'Enter text here...',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _addItem,
                      child: Text(_isLoading ? 'Loading...' : 'Add'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.blue,
                        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: _items.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.inbox,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'No items yet. Add one above!',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: _items.length,
                    itemBuilder: (context, index) {{
                      final item = _items[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          title: Text(item['text']),
                          subtitle: Text(
                            '${{item['timestamp'].toString().substring(11, 19)}}',
                          ),
                          onTap: () => _handleItemTap(item),
                          trailing: Icon(Icons.arrow_forward_ios),
                        ),
                      );
                    }},
                  ),
          ),
        ],
      ),
    );
  }}

  @override
  void dispose() {{
    _controller.dispose();
    super.dispose();
  }}
}}'''
        
        return template
    
    async def _generate_ionic_app(self, app_name: str, description: str) -> str:
        """Generate Ionic application"""
        template = f'''import {{ Component, OnInit }} from '@angular/core';

interface AppItem {{
  id: number;
  text: string;
  timestamp: Date;
}}

@Component({{
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
}})
export class HomePage implements OnInit {{
  appName = '{app_name}';
  description = '{description}';
  items: AppItem[] = [];
  inputText = '';
  isLoading = false;

  ngOnInit() {{
    this.initializeApp();
  }}

  async initializeApp() {{
    this.isLoading = true;
    
    // Simulate initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.isLoading = false;
  }}

  addItem() {{
    if (this.inputText.trim()) {{
      this.items.push({{
        id: Date.now(),
        text: this.inputText,
        timestamp: new Date()
      }});
      this.inputText = '';
    }}
  }}

  async handleItemClick(item: AppItem) {{
    const alert = await this.alertController.create({{
      header: 'Item Selected',
      message: `You selected: ${{item.text}}`,
      buttons: ['OK']
    }});

    await alert.present();
  }}

  constructor(private alertController: AlertController) {{}}
}}

// home.page.html template
/*
<ion-header [translucent]="true">
  <ion-toolbar color="primary">
    <ion-title>
      {{{{ appName }}}}
    </ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">{{{{ appName }}}}</ion-title>
    </ion-toolbar>
  </ion-header>

  <div class="app-container">
    <div class="header-section">
      <p class="description">{{{{ description }}}}</p>
      
      <div class="input-section">
        <ion-item>
          <ion-input 
            [(ngModel)]="inputText" 
            placeholder="Enter text here..."
            (keyup.enter)="addItem()">
          </ion-input>
          <ion-button 
            slot="end" 
            (click)="addItem()"
            [disabled]="isLoading">
            {{{{ isLoading ? 'Loading...' : 'Add' }}}}
          </ion-button>
        </ion-item>
      </div>
    </div>

    <div class="content-section">
      <ion-list *ngIf="items.length > 0; else emptyState">
        <ion-item 
          *ngFor="let item of items" 
          button 
          (click)="handleItemClick(item)">
          <ion-label>
            <h2>{{{{ item.text }}}}</h2>
            <p>{{{{ item.timestamp | date:'short' }}}}</p>
          </ion-label>
          <ion-icon name="chevron-forward" slot="end"></ion-icon>
        </ion-item>
      </ion-list>

      <ng-template #emptyState>
        <div class="empty-state">
          <ion-icon name="inbox-outline" size="large"></ion-icon>
          <p>No items yet. Add one above!</p>
        </div>
      </ng-template>
    </div>
  </div>
</ion-content>
*/

// home.page.scss styles
/*
.app-container {{
  padding: 16px;
}}

.header-section {{
  margin-bottom: 20px;
}}

.description {{
  text-align: center;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}}

.input-section {{
  margin-bottom: 20px;
}}

.content-section {{
  flex: 1;
}}

.empty-state {{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  color: var(--ion-color-medium);
}}

.empty-state ion-icon {{
  margin-bottom: 16px;
}}
*/'''
        
        return template
    
    async def _generate_generic_app(self, app_name: str, description: str, framework_info: MobileFramework) -> str:
        """Generate a generic mobile application template"""
        return f'''// {app_name}
// Framework: {framework_info.name}
// Language: {framework_info.language}

/*
 * {description}
 * 
 * This is a basic template for {framework_info.name} application.
 * Customize this code according to your specific requirements.
 */

// Main application entry point
function main() {{
    console.log("Starting {app_name}...");
    
    // Initialize your app here
    initializeApp();
}}

function initializeApp() {{
    // Add your initialization logic here
    console.log("{app_name} initialized successfully!");
}}

// Export or run the main function
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {{ main }};
}} else {{
    main();
}}'''
    
    def get_framework_info(self, framework: str) -> Optional[MobileFramework]:
        """Get information about a mobile framework"""
        return self.frameworks.get(framework)
    
    def get_supported_frameworks(self) -> Dict[str, Dict[str, Any]]:
        """Get list of supported frameworks"""
        return {
            framework_id: {
                "name": framework.name,
                "language": framework.language,
                "file_extension": framework.file_extension,
                "template_structure": framework.template_structure
            }
            for framework_id, framework in self.frameworks.items()
        }